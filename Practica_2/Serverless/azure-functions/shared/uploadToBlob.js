const { BlobServiceClient } = require('@azure/storage-blob');
const { randomUUID } = require('crypto');
const { validate, problem } = require('./validation');
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};
async function uploadToBlob(prefix, req, imageOnly) {
  if (req.method === 'OPTIONS') return { status: 204, headers };
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { problem(400, 'JSON invalido'); }
    }
    const file = validate(body, imageOnly);
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING || !process.env.AZURE_STORAGE_CONTAINER) problem(503, 'Almacenamiento no configurado');
    const key = `${prefix}/${randomUUID()}-${file.fileName}`;
    const service = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const blob = service.getContainerClient(process.env.AZURE_STORAGE_CONTAINER).getBlockBlobClient(key);
    await blob.uploadData(file.buffer, { blobHTTPHeaders: { blobContentType: file.contentType } });
    return { status: 200, headers, body: { url: blob.url } };
  } catch (error) {
    return { status: error.status || 500, headers, body: { error: error.status ? error.message : 'Error interno del servidor' } };
  }
}
module.exports = { uploadToBlob };
