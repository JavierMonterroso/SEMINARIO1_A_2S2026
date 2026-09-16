const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.AWS_S3_BUCKET;

// Agrupe las dos funciones en un solo archivo para reutilizar el cliente de S3.
// En Lambda se configuran como handlers separados: index.uploadImage e index.uploadText.
async function uploadFile(event, prefix) {
  const body = JSON.parse(event.body);
  const { fileName, contentType, data } = body;

  if (!fileName || !contentType || !data) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'fileName, contentType y data son obligatorios' }),
    };
  }

  const key = `${prefix}/${Date.now()}-${fileName}`;
  const buffer = Buffer.from(data, 'base64');

  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  };
}

exports.uploadImage = (event) => uploadFile(event, 'files/images');
exports.uploadText = (event) => uploadFile(event, 'files/documents');
