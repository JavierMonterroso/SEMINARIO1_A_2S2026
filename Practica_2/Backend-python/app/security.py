import bcrypt
import jwt
import time
from . import config


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=10)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(payload: dict) -> str:
    to_encode = payload.copy()
    to_encode["iat"] = int(time.time())
    to_encode["exp"] = to_encode["iat"] + config.JWT_EXPIRES_IN_HOURS * 3600
    return jwt.encode(to_encode, config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"], options={"verify_iat": False})
    if type(payload.get("id")) is not int or payload["id"] < 1 or not isinstance(payload.get("username"), str) or not payload["username"] or type(payload.get("exp")) is not int:
        raise jwt.InvalidTokenError("Token invalido")
    return payload
