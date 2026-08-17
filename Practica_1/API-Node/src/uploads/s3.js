const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');

const s3 = new S3Client({ region: config.aws.region });

async function uploadToS3({ buffer, key, contentType }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.aws.imagesBucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

module.exports = { uploadToS3 };
