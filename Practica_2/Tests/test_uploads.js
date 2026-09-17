const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const uploads = [];
function load(file, extra = {}) {
  const filename = path.join(root, file);
  const module = { exports: {} };
  const localRequire = createRequire(filename);
  const mocks = {
    '@aws-sdk/client-s3': {
      S3Client: class { async send(command) { uploads.push(command.input); } },
      PutObjectCommand: class { constructor(input) { this.input = input; } },
    },
    '@azure/storage-blob': {
      BlobServiceClient: { fromConnectionString() { return { getContainerClient() { return { getBlockBlobClient(key) { return {
        url: `https://storage.example/${key}`,
        async uploadData(buffer, options) { uploads.push({ Body: buffer, ContentType: options.blobHTTPHeaders.blobContentType }); },
      }; } }; } }; } },
    },
    ...extra,
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    module, exports: module.exports, Buffer, process,
    require: name => Object.hasOwn(mocks, name) ? mocks[name] : localRequire(name),
  }, { filename });
  return module.exports;
}
async function main() {
  process.env.AWS_REGION = 'us-east-2';
  process.env.AWS_S3_BUCKET = 'test-files';
  process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-only';
  process.env.AZURE_STORAGE_CONTAINER = 'test-files';
  const aws = load('Serverless/aws-lambda/index.js');
  const azure = load('Serverless/azure-functions/shared/uploadToBlob.js');
  let cases = 0;
  for (const [type, name, imageOnly] of [['image/png','foto á #?.png',true],['text/plain','documento.txt',false],['application/pdf','documento.pdf',false],['application/octet-stream','archivo.bin',false]]) {
    const body = { fileName: name, contentType: type, data: Buffer.from('file-content').toString('base64') };
    const a = await (imageOnly ? aws.uploadImage : aws.uploadText)({ httpMethod:'POST', body:JSON.stringify(body) });
    const b = await azure.uploadToBlob(imageOnly?'files/images':'files/documents', { method:'POST', body }, imageOnly);
    assert.equal(a.statusCode,200); assert.equal(b.status,200);
    assert.ok(JSON.parse(a.body).url.startsWith('https://'));
    assert.ok(b.body.url.startsWith('https://'));
    assert.equal(a.headers['Access-Control-Allow-Origin'],'*');
    assert.equal(b.headers['Access-Control-Allow-Origin'],'*');
    for (const result of uploads.splice(0)) {
      assert.equal(result.Body.toString(),'file-content');
      assert.equal(result.ContentType,type);
      assert.equal(result.ACL,undefined);
    }
    cases++;
  }
  for (const body of [{}, {fileName:'x',contentType:'text/plain',data:'bad'}, {fileName:'x',contentType:'invalid',data:'eA=='}, {fileName:'x',contentType:'text/plain',data:'Zh=='}]) {
    const a = await aws.uploadText({body:JSON.stringify(body)});
    const b = await azure.uploadToBlob('files/documents',{method:'POST',body},false);
    assert.equal(a.statusCode,400); assert.equal(b.status,400);
    assert.equal(JSON.stringify(JSON.parse(a.body)),JSON.stringify(b.body));
    cases++;
  }
  const oversized = {fileName:'x',contentType:'text/plain',data:Buffer.alloc(5*1024*1024+1).toString('base64')};
  assert.equal((await aws.uploadText({body:JSON.stringify(oversized)})).statusCode,413);
  assert.equal((await azure.uploadToBlob('files/documents',{method:'POST',body:oversized},false)).status,413);
  assert.equal((await aws.uploadText({body:'{'})).statusCode,400);
  assert.equal((await azure.uploadToBlob('files/documents',{method:'POST',body:'{'},false)).status,400);
  assert.equal((await aws.uploadImage({body:JSON.stringify({fileName:'x',contentType:'text/plain',data:'eA=='})})).statusCode,400);
  assert.equal((await aws.uploadImage({httpMethod:'OPTIONS'})).statusCode,204);
  assert.equal((await azure.uploadToBlob('files/images',{method:'OPTIONS'},true)).status,204);
  delete process.env.AWS_S3_BUCKET;
  delete process.env.AZURE_STORAGE_CONTAINER;
  const body = {fileName:'x',contentType:'text/plain',data:'eA=='};
  const a = await aws.uploadText({body:JSON.stringify(body)});
  const b = await azure.uploadToBlob('files/documents',{method:'POST',body},false);
  assert.equal(a.statusCode,503); assert.equal(b.status,503);
  assert.equal(JSON.stringify(JSON.parse(a.body)),JSON.stringify(b.body));
  // El backend tambien debe cargar fotos sin ACL, respetar los bytes y codificar la URL.
  process.env.AWS_S3_BUCKET = 'test-files';
  process.env.STORAGE_PROVIDER = 's3';
  const storage = load('Backend-node/src/config/storage.js');
  const url = await storage.uploadBuffer(Buffer.from('image'),'profile-images/foto á #?.png','image/png');
  assert.ok(url.includes('%20') && url.includes('%23') && url.includes('%3F'));
  assert.equal(uploads.pop().ACL,undefined);
  console.log(`Funciones AWS/Azure: ${cases} casos de carga y comprobaciones de errores, limites, CORS y configuracion correctos`);
}
main().catch(error => { console.error(error); process.exitCode=1; });
