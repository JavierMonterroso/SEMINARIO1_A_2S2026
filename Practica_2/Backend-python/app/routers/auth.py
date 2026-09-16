from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from psycopg2.extras import RealDictCursor
from .. import database, security, storage
from ..schemas import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    profileImage: UploadFile = File(default=None),
):
    if password != confirmPassword:
        raise HTTPException(status_code=400, detail="Las contrasenas no coinciden")

    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                raise HTTPException(status_code=409, detail="El nombre de usuario ya existe")

            profile_image_url = None
            if profileImage is not None:
                data = await profileImage.read()
                key = storage.build_key("profile-images", profileImage.filename)
                profile_image_url = storage.upload_buffer(data, key, profileImage.content_type)

            password_hash = security.hash_password(password)

            cur.execute(
                """INSERT INTO users (username, email, password_hash, profile_image_url)
                   VALUES (%s, %s, %s, %s)
                   RETURNING id, username, email, profile_image_url, created_at""",
                (username, email, password_hash, profile_image_url),
            )
            user = cur.fetchone()
            conn.commit()
            return {"user": user}
    finally:
        database.release_connection(conn)


@router.post("/login")
def login(body: LoginRequest):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE username = %s", (body.username,))
            user = cur.fetchone()

            if not user or not security.verify_password(body.password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="Credenciales invalidas")

            token = security.create_token({"id": user["id"], "username": user["username"]})

            return {
                "token": token,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "profile_image_url": user["profile_image_url"],
                },
            }
    finally:
        database.release_connection(conn)
