from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str

    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str
    s3_bucket_images: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8"
    )

settings = Settings()

