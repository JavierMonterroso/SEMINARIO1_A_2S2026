const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { BlobServiceClient } = require('@azure/storage-blob');

function unavailable() {
  const error = new Error('Almacenamiento no configurado');
  error.status = 503;
  throw error;
}

async function uploadBuffer(buffer, key, contentType) {
  const provider = process.env.STORAGE_PROVIDER || 's3';
  if (provider === 'azure') {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING || !process.env.AZURE_STORAGE_CONTAINER) unavailable();
    const service = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const blob = service.getContainerClient(process.env.AZURE_STORAGE_CONTAINER).getBlockBlobClient(key);
    await blob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
    return blob.url;
  }
  if (provider !== 's3' || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) unavailable();
  const client = new S3Client({ region: process.env.AWS_REGION });
  // Lectura publica mediante politica de bucket; no requiere ACL de objetos.
  await client.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;
}

module.exports = { uploadBuffer };
