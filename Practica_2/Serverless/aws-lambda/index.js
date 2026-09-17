const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');
const { validate, problem } = require('./validation');
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};
const response = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

async function uploadFile(event, prefix, imageOnly) {
  const method = event.requestContext?.http?.method || event.httpMethod || 'POST';
  if (method === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (method !== 'POST') return response(405, { error: 'Metodo no permitido' });
  try {
    let body;
    try {
      const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body;
      if (typeof raw === 'string' && Buffer.byteLength(raw) > 8 * 1024 * 1024) problem(413, 'La solicitud supera el limite de 8 MB');
      body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (error) {
      if (error.status) throw error;
      problem(400, 'JSON invalido');
    }
    const file = validate(body, imageOnly);
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket || !region) problem(503, 'Almacenamiento no configurado');
    const key = `${prefix}/${randomUUID()}-${file.fileName}`;
    await new S3Client({ region }).send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.contentType }));
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    return response(200, { url: `https://${bucket}.s3.${region}.amazonaws.com/${encoded}` });
  } catch (error) {
    return response(error.status || 500, { error: error.status ? error.message : 'Error interno del servidor' });
  }
}
exports.uploadImage = (event) => uploadFile(event, 'files/images', true);
// Tambien acepta otros documentos binarios para cumplir la carga de cualquier tipo.
exports.uploadText = (event) => uploadFile(event, 'files/documents', false);
