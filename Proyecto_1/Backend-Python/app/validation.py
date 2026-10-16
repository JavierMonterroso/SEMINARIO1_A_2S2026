import base64
import binascii
import re
from .errors import ApiError

MAX_IMAGE_BYTES = 4 * 1024 * 1024
MAX_ID = 2147483647
IMAGE_DATA_URL = re.compile(r"data:(image/(?:jpeg|png));base64,([A-Za-z0-9+/]+={0,2})")
EMAIL_PATTERN = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")
DPI_PATTERN = re.compile(r"\d{13}", re.ASCII)
ID_PATTERN = re.compile(r"[1-9]\d{0,9}", re.ASCII)
LANGUAGES = ("es", "en", "fr", "pt")


def fail(field):
    raise ApiError(400, f"El campo '{field}' es obligatorio o inválido")


def object_body(value):
    if not isinstance(value, dict):
        fail("body")
    return value


def text(value, field, maximum):
    if not isinstance(value, str) or "\0" in value:
        fail(field)
    result = value.strip()
    if not result or len(result) > maximum:
        fail(field)
    return result


def optional_text(value, field, maximum):
    is_blank = value is None or (isinstance(value, str) and not value.strip())
    return None if is_blank else text(value, field, maximum)


def email(value):
    result = text(value, "email", 255).lower()
    if not EMAIL_PATTERN.fullmatch(result):
        fail("email")
    return result


def dpi(value):
    result = text(value, "dpi", 13)
    if not DPI_PATTERN.fullmatch(result):
        fail("dpi")
    return result


# Las reglas de complejidad las aplica la politica de contrasenas de Cognito.
def password(value, field):
    if not isinstance(value, str) or not value or len(value) > 256:
        fail(field)
    return value


def image(value, field):
    match = IMAGE_DATA_URL.fullmatch(value) if isinstance(value, str) else None
    if not match:
        fail(field)
    try:
        data = base64.b64decode(match.group(2))
    except binascii.Error:
        fail(field)
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise ApiError(400, "La imagen debe pesar como máximo 4 MB")
    return {"content_type": match.group(1), "data": match.group(2), "bytes": data}


def identifier(value, field="id"):
    result = int(value) if isinstance(value, str) and ID_PATTERN.fullmatch(value) else value
    if type(result) is not int or not 1 <= result <= MAX_ID:
        fail(field)
    return result


def language(value, field):
    if value not in LANGUAGES:
        fail(field)
    return value


def register(value):
    object_body(value)
    plain = password(value.get("password"), "password")
    if plain != value.get("confirmPassword"):
        raise ApiError(400, "Las contraseñas no coinciden")
    return {
        "full_name": text(value.get("fullName"), "fullName", 150),
        "email": email(value.get("email")),
        "dpi": dpi(value.get("dpi")),
        "password": plain,
        "photo": image(value.get("photo"), "photo"),
    }


def confirmation(value):
    object_body(value)
    return {"email": email(value.get("email")), "code": text(value.get("code"), "code", 10)}


def email_only(value):
    object_body(value)
    return email(value.get("email"))


def login(value):
    object_body(value)
    return {"email": email(value.get("username")), "password": password(value.get("password"), "password")}


def face_login(value):
    object_body(value)
    return {"email": email(value.get("username")), "photo": image(value.get("photo"), "photo")}


def profile(value):
    object_body(value)
    return {
        "full_name": text(value.get("fullName"), "fullName", 150),
        "dpi": dpi(value.get("dpi")),
        "password": password(value.get("password"), "password"),
        "photo": image(value["photo"], "photo") if value.get("photo") else None,
    }


def post(value):
    object_body(value)
    return {
        "description": optional_text(value.get("description"), "description", 2000),
        "image": image(value.get("image"), "image"),
    }


def post_filter(query):
    return {
        "label": optional_text(query.get("label"), "label", 100),
        "search": optional_text(query.get("search"), "search", 100),
    }


def content(value, maximum):
    object_body(value)
    return text(value.get("content"), "content", maximum)


def friend_request(value):
    object_body(value)
    return identifier(value.get("receiverId"), "receiverId")


def translation(value):
    object_body(value)
    return {
        "text": text(value.get("text"), "text", 5000),
        "target_language": language(value.get("targetLanguage"), "targetLanguage"),
    }


def speech(value):
    object_body(value)
    return {
        "text": text(value.get("text"), "text", 3000),
        "language": language(value["language"], "language") if value.get("language") else None,
    }


def chatbot_message(value):
    object_body(value)
    return text(value.get("message"), "message", 1024)
