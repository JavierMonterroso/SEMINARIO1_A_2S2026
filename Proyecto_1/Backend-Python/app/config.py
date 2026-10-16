import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Toda la configuracion vive aqui para que el resto del codigo no lea os.environ.
PORT = int(os.getenv("PORT", "3000"))

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRES_IN_HOURS = int(os.getenv("JWT_EXPIRES_IN_HOURS", "8"))

AWS_REGION = os.getenv("AWS_REGION")

COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")

IMAGE_UPLOAD_URL = os.getenv("IMAGE_UPLOAD_URL")
IMAGE_UPLOAD_API_KEY = os.getenv("IMAGE_UPLOAD_API_KEY")
IMAGES_BUCKET = os.getenv("IMAGES_BUCKET")
IMAGES_BASE_URL = (os.getenv("IMAGES_BASE_URL") or "").rstrip("/")

LEX_BOT_ID = os.getenv("LEX_BOT_ID")
LEX_BOT_ALIAS_ID = os.getenv("LEX_BOT_ALIAS_ID")
LEX_LOCALE_ID = os.getenv("LEX_LOCALE_ID", "es_US")

REQUIRED_VARIABLES = (
    "DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET", "AWS_REGION",
    "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID",
    "IMAGE_UPLOAD_URL", "IMAGE_UPLOAD_API_KEY", "IMAGES_BUCKET", "IMAGES_BASE_URL",
    "LEX_BOT_ID", "LEX_BOT_ALIAS_ID",
)


def validate():
    missing = [name for name in REQUIRED_VARIABLES if not (globals()[name] or "").strip()]
    if missing:
        raise RuntimeError("Completa estas variables en Backend-Python/.env: " + ", ".join(missing))
