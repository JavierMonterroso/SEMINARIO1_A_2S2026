from fastapi import APIRouter, Request, HTTPException
from psycopg2.extras import RealDictCursor
from .. import database, security, storage, validation
from ..serialize import row

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(request: Request):
    body = validation.register(request.state.json_body)
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s", (body["username"],))
            if cur.fetchone():
                raise HTTPException(409, "El nombre de usuario ya existe")
            image = body["profileImage"]
            key = storage.build_key("profile-images", image["fileName"])
            image_url = storage.upload_buffer(image["buffer"], key, image["contentType"])
            cur.execute(
                """INSERT INTO users (username, email, password_hash, profile_image_url)
                   VALUES (%s, %s, %s, %s)
                   RETURNING id, username, email, profile_image_url, created_at""",
                (body["username"], body["email"], security.hash_password(body["password"]), image_url),
            )
            user = cur.fetchone()
            conn.commit()
            return {"user": row(user)}
    finally:
        database.release_connection(conn)


@router.post("/login")
def login(request: Request):
    body = validation.login(request.state.json_body)
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE username = %s", (body["username"],))
            user = cur.fetchone()
            if not user or not security.verify_password(body["password"], user["password_hash"]):
                raise HTTPException(401, "Credenciales invalidas")
            return {
                "token": security.create_token({"id": user["id"], "username": user["username"]}),
                "user": {key: user[key] for key in ("id", "username", "email", "profile_image_url")},
            }
    finally:
        database.release_connection(conn)
