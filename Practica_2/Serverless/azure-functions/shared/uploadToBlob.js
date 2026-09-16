const { BlobServiceClient } = require('@azure/storage-blob');

// Centralice la subida a Blob Storage para que las dos funciones solo definan su prefijo.
async function uploadToBlob(prefix, req) {
  const { fileName, contentType, data } = req.body || {};

  if (!fileName || !contentType || !data) {
    return { status: 400, body: { error: 'fileName, contentType y data son obligatorios' } };
  }

  const key = `${prefix}/${Date.now()}-${fileName}`;
  const buffer = Buffer.from(data, 'base64');

  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(key);

  await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });

  return { status: 200, body: { url: blockBlobClient.url } };
}

module.exports = { uploadToBlob };
