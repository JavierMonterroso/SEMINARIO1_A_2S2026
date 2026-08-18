import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.config import settings

_s3_client = boto3.client(
    "s3",
    region_name=settings.aws_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
)


def upload_image(file: UploadFile, folder: str) -> str:
    extension = Path(file.filename or "").suffix or ".jpg"
    key = f"{folder}/{uuid.uuid4().hex}{extension}"

    _s3_client.upload_fileobj(
        file.file,
        settings.s3_bucket_images,
        key,
        ExtraArgs={"ContentType": file.content_type or "image/jpeg"}
    )

    return key
