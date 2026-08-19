import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.config import settings

_client_options = {"region_name": settings.aws_region}

# En EC2, boto3 obtiene credenciales temporales automáticamente desde el rol
# de la instancia. Las claves explícitas quedan disponibles solo para pruebas
# locales cuando ambas variables están configuradas.
if settings.aws_access_key_id and settings.aws_secret_access_key:
    _client_options.update(
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )

_s3_client = boto3.client("s3", **_client_options)


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
