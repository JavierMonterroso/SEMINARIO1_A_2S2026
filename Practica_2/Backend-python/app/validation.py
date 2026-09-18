import re
from urllib.parse import urlsplit
from fastapi import HTTPException


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


def public_url(value, field):
    result = text(value, field, 4096)
    if not re.fullmatch(r"https?://[^\s/?#]+(?:[/?#][^\s]*)?", result):
        fail(field)
    try:
        parsed = urlsplit(result)
        if not parsed.hostname or parsed.username or parsed.password:
            fail(field)
        # Acceder al puerto también comprueba su formato y rango.
        parsed.port
    except ValueError:
        fail(field)
    return result


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
    return {"username": username, "email": email, "password": plain, "profileImageUrl": public_url(value.get("profileImageUrl"), "profileImageUrl")}


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
    url = public_url(value.get("url"), "url")
    if not re.fullmatch(r"[\w.+-]+/[\w.+-]+", file_type, re.ASCII):
        fail("type")
    if not file_type.startswith("image/") and (file_type != "text/plain" or not name.lower().endswith(".txt")):
        fail("type")
    return {"name": name, "type": file_type, "url": url}


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r"[1-9][0-9]*", value) or len(value) > 10 or int(value) > 2147483647:
        fail("id")
    return int(value)
