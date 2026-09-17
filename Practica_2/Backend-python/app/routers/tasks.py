from fastapi import APIRouter, Depends, HTTPException, Request, Response
from .. import validation
from ..database import execute
from ..dependencies import get_current_user
from ..serialize import row

router = APIRouter(prefix="/tasks", tags=["tasks"])


def found(task):
    if not task:
        raise HTTPException(404, "Tarea no encontrada")
    return {"task": row(task)}


@router.get("")
def list_tasks(user=Depends(get_current_user)):
    tasks = execute("SELECT * FROM tasks WHERE user_id = %s ORDER BY created_at DESC, id DESC", (user["id"],), many=True)
    return {"tasks": [row(task) for task in tasks]}


@router.post("", status_code=201)
def create_task(request: Request, user=Depends(get_current_user)):
    body = validation.task(request.state.json_body)
    task = execute(
        "INSERT INTO tasks (user_id, title, description) VALUES (%s, %s, %s) RETURNING *",
        (user["id"], body["title"], body["description"]),
    )
    return {"task": row(task)}


@router.put("/{task_id}")
def update_task(task_id: str, request: Request, user=Depends(get_current_user)):
    identifier = validation.identifier(task_id)
    body = validation.task(request.state.json_body, update=True)
    return found(execute(
        """UPDATE tasks SET title = COALESCE(%s, title),
           description = CASE WHEN %s THEN %s ELSE description END
           WHERE id = %s AND user_id = %s RETURNING *""",
        (body.get("title"), "description" in body, body.get("description"), identifier, user["id"]),
    ))


@router.patch("/{task_id}/complete")
def complete_task(task_id: str, request: Request, user=Depends(get_current_user)):
    identifier = validation.identifier(task_id)
    completed = validation.complete(request.state.json_body)
    return found(execute(
        "UPDATE tasks SET completed = %s WHERE id = %s AND user_id = %s RETURNING *",
        (completed, identifier, user["id"]),
    ))


@router.delete("/{task_id}", status_code=204, response_class=Response)
def delete_task(task_id: str, user=Depends(get_current_user)):
    identifier = validation.identifier(task_id)
    if not execute("DELETE FROM tasks WHERE id = %s AND user_id = %s RETURNING id", (identifier, user["id"])):
        raise HTTPException(404, "Tarea no encontrada")
    return Response(status_code=204)
