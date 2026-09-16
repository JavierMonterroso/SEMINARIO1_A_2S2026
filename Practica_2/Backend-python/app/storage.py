import time
import boto3
from azure.storage.blob import BlobServiceClient, ContentSettings
from . import config

_s3_client = boto3.client("s3", region_name=config.AWS_REGION)


def _upload_to_s3(data: bytes, key: str, content_type: str) -> str:
    _s3_client.put_object(
        Bucket=config.AWS_S3_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
        ACL="public-read",
    )
    return f"https://{config.AWS_S3_BUCKET}.s3.{config.AWS_REGION}.amazonaws.com/{key}"


def _upload_to_azure(data: bytes, key: str, content_type: str) -> str:
    blob_service = BlobServiceClient.from_connection_string(config.AZURE_STORAGE_CONNECTION_STRING)
    blob_client = blob_service.get_blob_client(container=config.AZURE_STORAGE_CONTAINER, blob=key)
    blob_client.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type=content_type))
    return blob_client.url


def upload_buffer(data: bytes, key: str, content_type: str) -> str:
    if config.STORAGE_PROVIDER == "azure":
        return _upload_to_azure(data, key, content_type)
    return _upload_to_s3(data, key, content_type)


def build_key(prefix: str, filename: str) -> str:
    return f"{prefix}/{int(time.time() * 1000)}-{filename}"
