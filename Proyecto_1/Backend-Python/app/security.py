import hashlib
import time
import jwt
from . import config


# La rubrica pide MD5. La autenticacion real la hace Cognito, no esta funcion.
def md5(plain):
    return hashlib.md5(plain.encode("utf-8")).hexdigest()


def sign_token(user):
    issued_at = int(time.time())
    payload = {
        "id": user["id"],
        "email": user["email"],
        "iat": issued_at,
        "exp": issued_at + config.JWT_EXPIRES_IN_HOURS * 3600,
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def verify_token(token):
    payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    if type(payload.get("id")) is not int or not isinstance(payload.get("email"), str):
        raise jwt.InvalidTokenError("Token invalido")
    return payload
