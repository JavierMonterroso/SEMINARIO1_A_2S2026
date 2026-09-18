import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

PORT = int(os.getenv("PORT", "3000"))

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRES_IN_HOURS = int(os.getenv("JWT_EXPIRES_IN_HOURS", "24"))

def validate():
    missing = [name for name in ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET") if not (globals()[name] or "").strip()]
    if missing:
        raise RuntimeError("Completa estas variables en Backend-python/.env: " + ", ".join(missing))
    if not 1 <= JWT_EXPIRES_IN_HOURS <= 8760:
        raise RuntimeError("JWT_EXPIRES_IN_HOURS debe ser un entero entre 1 y 8760")
