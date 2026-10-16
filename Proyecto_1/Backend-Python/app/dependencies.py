import jwt
from fastapi import Header
from . import security
from .errors import ApiError


def get_current_user(authorization: str = Header(default="")):
    token = authorization[7:] if authorization.startswith("Bearer ") else ""
    if not token:
        raise ApiError(401, "Token no proporcionado")
    try:
        return security.verify_token(token)
    except jwt.PyJWTError:
        raise ApiError(401, "Token inválido o expirado")
