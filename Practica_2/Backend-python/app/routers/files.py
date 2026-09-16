from fastapi import APIRouter, Depends, HTTPException
from psycopg2.extras import RealDictCursor
from .. import database
from ..dependencies import get_current_user
from ..schemas import FileCreateRequest

router = APIRouter(prefix="/files", tags=["files"])


@router.get("")
def list_files(user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM files WHERE user_id = %s ORDER BY created_at DESC",
                (user["id"],),
            )
            return {"files": cur.fetchall()}
    finally:
        database.release_connection(conn)


@router.post("", status_code=201)
def register_file(body: FileCreateRequest, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO files (user_id, name, type, url)
                   VALUES (%s, %s, %s, %s) RETURNING *""",
                (user["id"], body.name, body.type, body.url),
            )
            file = cur.fetchone()
            conn.commit()
            return {"file": file}
    finally:
        database.release_connection(conn)


@router.get("/{file_id}")
def get_file(file_id: int, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM files WHERE id = %s AND user_id = %s",
                (file_id, user["id"]),
            )
            file = cur.fetchone()
            if not file:
                raise HTTPException(status_code=404, detail="Archivo no encontrado")
            return {"file": file}
    finally:
        database.release_connection(conn)
