import re
from uuid import uuid4
from urllib.parse import quote
import boto3
from azure.storage.blob import BlobServiceClient, ContentSettings
from fastapi import HTTPException
from . import config


def upload_buffer(data: bytes, key: str, content_type: str) -> str:
    if config.STORAGE_PROVIDER == "azure":
        if not config.AZURE_STORAGE_CONNECTION_STRING or not config.AZURE_STORAGE_CONTAINER:
            raise HTTPException(503, "Almacenamiento no configurado")
        service = BlobServiceClient.from_connection_string(config.AZURE_STORAGE_CONNECTION_STRING)
        blob = service.get_blob_client(container=config.AZURE_STORAGE_CONTAINER, blob=key)
        blob.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type=content_type))
        return blob.url
    if config.STORAGE_PROVIDER != "s3" or not config.AWS_REGION or not config.AWS_S3_BUCKET:
        raise HTTPException(503, "Almacenamiento no configurado")
    client = boto3.client("s3", region_name=config.AWS_REGION)
    # Lectura publica mediante politica de bucket; no requiere ACL de objetos.
    client.put_object(Bucket=config.AWS_S3_BUCKET, Key=key, Body=data, ContentType=content_type)
    return f"https://{config.AWS_S3_BUCKET}.s3.{config.AWS_REGION}.amazonaws.com/{quote(key, safe='/')}"


def build_key(prefix: str, filename: str) -> str:
    name = re.sub(r"[\\/]", "_", filename)
    return f"{prefix}/{uuid4()}-{name}"
