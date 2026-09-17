from fastapi import APIRouter, Depends, HTTPException, Request
from .. import validation
from ..dependencies import get_current_user
from ..serialize import row
from ..database import execute

router = APIRouter(prefix="/files", tags=["files"])


@router.get("")
def list_files(user=Depends(get_current_user)):
    files = execute("SELECT * FROM files WHERE user_id = %s ORDER BY created_at DESC, id DESC", (user["id"],), many=True)
    return {"files": [row(file) for file in files]}


@router.post("", status_code=201)
def register_file(request: Request, user=Depends(get_current_user)):
    body = validation.file(request.state.json_body)
    file = execute(
        "INSERT INTO files (user_id, name, type, url) VALUES (%s, %s, %s, %s) RETURNING *",
        (user["id"], body["name"], body["type"], body["url"]),
    )
    return {"file": row(file)}


@router.get("/{file_id}")
def get_file(file_id: str, user=Depends(get_current_user)):
    identifier = validation.identifier(file_id)
    file = execute("SELECT * FROM files WHERE id = %s AND user_id = %s", (identifier, user["id"]))
    if not file:
        raise HTTPException(404, "Archivo no encontrado")
    return {"file": row(file)}
