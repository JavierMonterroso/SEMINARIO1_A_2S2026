const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { BlobServiceClient } = require('@azure/storage-blob');

// Deje una sola interfaz (uploadBuffer) para que los controladores no sepan si corren sobre AWS o Azure.
const provider = process.env.STORAGE_PROVIDER || 's3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function uploadToS3(buffer, key, contentType) {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

async function uploadToAzure(buffer, key, contentType) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(key);
  await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return blockBlobClient.url;
}

async function uploadBuffer(buffer, key, contentType) {
  if (provider === 'azure') {
    return uploadToAzure(buffer, key, contentType);
  }
  return uploadToS3(buffer, key, contentType);
}

module.exports = { uploadBuffer };
