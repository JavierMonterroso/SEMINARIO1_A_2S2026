from fastapi import Header, HTTPException
import jwt
from . import security


def get_current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer ") or not authorization[7:]:
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    token = authorization[7:]
    try:
        return security.decode_token(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalido o expirado")
