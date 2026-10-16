from datetime import timezone
from . import config


# Mismo formato que JSON.stringify(Date) en el backend Node: 2026-10-15T18:00:00.000Z
def iso(moment):
    utc = moment.astimezone(timezone.utc)
    return utc.strftime("%Y-%m-%dT%H:%M:%S.") + f"{utc.microsecond // 1000:03d}Z"


def image_url(key):
    return f"{config.IMAGES_BASE_URL}/{key}"


def own_user(row):
    return {
        "id": row["id"],
        "fullName": row["full_name"],
        "email": row["email"],
        "dpi": row["dpi"],
        "photoUrl": image_url(row["photo_key"]),
    }


def public_user(row):
    return {"id": row["id"], "fullName": row["full_name"], "photoUrl": image_url(row["photo_key"])}


# Las consultas con JOIN traen al autor con el prefijo author_.
def author(row):
    return {"id": row["author_id"], "fullName": row["author_name"], "photoUrl": image_url(row["author_photo_key"])}


def comment(row):
    return {"id": row["id"], "content": row["content"], "createdAt": iso(row["created_at"]), "author": author(row)}


def post(row, labels, comments):
    return {
        "id": row["id"],
        "description": row["description"],
        "imageUrl": image_url(row["image_key"]),
        "createdAt": iso(row["created_at"]),
        "author": author(row),
        "labels": labels,
        "comments": comments,
    }


def message(row):
    return {
        "id": row["id"],
        "senderId": row["sender_id"],
        "receiverId": row["receiver_id"],
        "content": row["content"],
        "createdAt": iso(row["created_at"]),
    }
