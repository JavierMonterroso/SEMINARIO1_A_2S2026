const { DetectLabelsCommand, CompareFacesCommand } = require('@aws-sdk/client-rekognition');
const { rekognition } = require('../config/aws');
const { config } = require('../config/env');

const MAX_LABELS = 10;
const MIN_LABEL_CONFIDENCE = 80;
const MIN_FACE_SIMILARITY = 90;

async function detectLabels(imageKey) {
  const result = await rekognition.send(new DetectLabelsCommand({
    Image: { S3Object: { Bucket: config.images.bucket, Name: imageKey } },
    MaxLabels: MAX_LABELS,
    MinConfidence: MIN_LABEL_CONFIDENCE,
  }));
  return [...new Set(result.Labels.map((label) => label.Name))];
}

async function facesMatch(photoBytes, profilePhotoKey) {
  try {
    const result = await rekognition.send(new CompareFacesCommand({
      SourceImage: { Bytes: photoBytes },
      TargetImage: { S3Object: { Bucket: config.images.bucket, Name: profilePhotoKey } },
      SimilarityThreshold: MIN_FACE_SIMILARITY,
    }));
    return result.FaceMatches.length > 0;
  } catch (error) {
    // Rekognition lanza InvalidParameterException cuando no encuentra un rostro.
    if (error.name === 'InvalidParameterException') return false;
    throw error;
  }
}

module.exports = { detectLabels, facesMatch };
