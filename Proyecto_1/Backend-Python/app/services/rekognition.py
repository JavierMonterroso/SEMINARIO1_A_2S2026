from botocore.exceptions import ClientError
from .. import config
from ..aws import rekognition

MAX_LABELS = 10
MIN_LABEL_CONFIDENCE = 80
MIN_FACE_SIMILARITY = 90


def detect_labels(image_key):
    result = rekognition.detect_labels(
        Image={"S3Object": {"Bucket": config.IMAGES_BUCKET, "Name": image_key}},
        MaxLabels=MAX_LABELS,
        MinConfidence=MIN_LABEL_CONFIDENCE,
    )
    return list(dict.fromkeys(label["Name"] for label in result["Labels"]))


def faces_match(photo_bytes, profile_photo_key):
    try:
        result = rekognition.compare_faces(
            SourceImage={"Bytes": photo_bytes},
            TargetImage={"S3Object": {"Bucket": config.IMAGES_BUCKET, "Name": profile_photo_key}},
            SimilarityThreshold=MIN_FACE_SIMILARITY,
        )
    except ClientError as error:
        # Rekognition lanza InvalidParameterException cuando no encuentra un rostro.
        if error.response["Error"]["Code"] == "InvalidParameterException":
            return False
        raise
    return len(result["FaceMatches"]) > 0
