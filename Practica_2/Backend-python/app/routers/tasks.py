from fastapi import APIRouter, Depends, HTTPException
from psycopg2.extras import RealDictCursor
from .. import database
from ..dependencies import get_current_user
from ..schemas import TaskCreateRequest, TaskUpdateRequest, TaskCompleteRequest

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
def list_tasks(user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM tasks WHERE user_id = %s ORDER BY created_at DESC",
                (user["id"],),
            )
            return {"tasks": cur.fetchall()}
    finally:
        database.release_connection(conn)


@router.post("", status_code=201)
def create_task(body: TaskCreateRequest, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO tasks (user_id, title, description)
                   VALUES (%s, %s, %s) RETURNING *""",
                (user["id"], body.title, body.description),
            )
            task = cur.fetchone()
            conn.commit()
            return {"task": task}
    finally:
        database.release_connection(conn)


@router.put("/{task_id}")
def update_task(task_id: int, body: TaskUpdateRequest, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """UPDATE tasks SET title = COALESCE(%s, title), description = COALESCE(%s, description)
                   WHERE id = %s AND user_id = %s RETURNING *""",
                (body.title, body.description, task_id, user["id"]),
            )
            task = cur.fetchone()
            conn.commit()
            if not task:
                raise HTTPException(status_code=404, detail="Tarea no encontrada")
            return {"task": task}
    finally:
        database.release_connection(conn)


@router.patch("/{task_id}/complete")
def complete_task(task_id: int, body: TaskCompleteRequest, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE tasks SET completed = %s WHERE id = %s AND user_id = %s RETURNING *",
                (body.completed, task_id, user["id"]),
            )
            task = cur.fetchone()
            conn.commit()
            if not task:
                raise HTTPException(status_code=404, detail="Tarea no encontrada")
            return {"task": task}
    finally:
        database.release_connection(conn)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, user=Depends(get_current_user)):
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM tasks WHERE id = %s AND user_id = %s RETURNING id",
                (task_id, user["id"]),
            )
            deleted = cur.fetchone()
            conn.commit()
            if not deleted:
                raise HTTPException(status_code=404, detail="Tarea no encontrada")
    finally:
        database.release_connection(conn)
