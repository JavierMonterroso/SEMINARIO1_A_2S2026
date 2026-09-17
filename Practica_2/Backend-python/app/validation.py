import base64
import binascii
import re
from fastapi import HTTPException

MAX_FILE_SIZE = 5 * 1024 * 1024


def fail(field):
    raise HTTPException(400, f"El campo '{field}' es obligatorio o invalido")


def object_body(value, field="body"):
    if not isinstance(value, dict):
        fail(field)
    return value


def text(value, field, maximum, trim=True, empty=False):
    if not isinstance(value, str) or "\0" in value:
        fail(field)
    result = value.strip() if trim else value
    if (not empty and not result) or len(result) > maximum:
        fail(field)
    return result


def password(value, field):
    result = text(value, field, 72, trim=False)
    try:
        if len(result.encode("utf-8")) > 72:
            fail(field)
    except UnicodeEncodeError:
        fail(field)
    return result


def upload(value, field="profileImage", image_only=True):
    object_body(value, field)
    name = text(value.get("fileName"), f"{field}.fileName", 255)
    content_type = text(value.get("contentType"), f"{field}.contentType", 100)
    if not re.fullmatch(r"[\w.+-]+/[\w.+-]+", content_type, re.ASCII) or (image_only and not content_type.startswith("image/")):
        fail(f"{field}.contentType")
    data = value.get("data")
    if not isinstance(data, str) or not data or len(data) % 4:
        fail(f"{field}.data")
    try:
        buffer = base64.b64decode(data, validate=True)
    except (ValueError, binascii.Error):
        fail(f"{field}.data")
    if not buffer or base64.b64encode(buffer).decode("ascii") != data:
        fail(f"{field}.data")
    if len(buffer) > MAX_FILE_SIZE:
        raise HTTPException(413, "El archivo supera el limite de 5 MB")
    return {"fileName": name, "contentType": content_type, "buffer": buffer}


def register(value):
    object_body(value)
    username = text(value.get("username"), "username", 50)
    email = text(value.get("email"), "email", 255)
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        fail("email")
    plain = password(value.get("password"), "password")
    confirm = password(value.get("confirmPassword"), "confirmPassword")
    if plain != confirm:
        raise HTTPException(400, "Las contrasenas no coinciden")
    return {"username": username, "email": email, "password": plain, "profileImage": upload(value.get("profileImage"))}


def login(value):
    object_body(value)
    return {"username": text(value.get("username"), "username", 50), "password": password(value.get("password"), "password")}


def task(value, update=False):
    object_body(value)
    result = {}
    if not update or "title" in value:
        result["title"] = text(value.get("title"), "title", 150)
    if "description" in value:
        result["description"] = None if value["description"] is None else text(value["description"], "description", 10000, trim=False, empty=True)
    elif not update:
        result["description"] = None
    if update and not result:
        fail("body")
    return result


def complete(value):
    object_body(value)
    if not isinstance(value.get("completed"), bool):
        fail("completed")
    return value["completed"]


def file(value):
    object_body(value)
    name = text(value.get("name"), "name", 255)
    file_type = text(value.get("type"), "type", 100)
    url = text(value.get("url"), "url", 4096)
    if not re.fullmatch(r"[\w.+-]+/[\w.+-]+", file_type, re.ASCII):
        fail("type")
    if not re.fullmatch(r"https?://[^\s/?#]+(?:[/?#][^\s]*)?", url):
        fail("url")
    return {"name": name, "type": file_type, "url": url}


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r"[1-9][0-9]*", value) or len(value) > 10 or int(value) > 2147483647:
        fail("id")
    return int(value)
