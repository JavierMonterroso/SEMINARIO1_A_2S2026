from fastapi import APIRouter, Depends, Request
from psycopg2.errors import UniqueViolation
from .. import serialize, validation
from ..dependencies import get_current_user
from ..errors import ApiError
from ..repositories import friendships, users

router = APIRouter()


@router.get("/users/suggestions")
def suggestions(user=Depends(get_current_user)):
    rows = friendships.suggestions(user["id"])
    result = [
        {**serialize.public_user(row), "requestStatus": row["request_status"], "requestId": row["request_id"]}
        for row in rows
    ]
    return {"users": result}


@router.get("/friends")
def list_friends(user=Depends(get_current_user)):
    return {"friends": [serialize.public_user(row) for row in friendships.friends(user["id"])]}


@router.get("/friend-requests")
def list_requests(user=Depends(get_current_user)):
    rows = friendships.pending_requests(user["id"])
    requests = [
        {"id": row["request_id"], "createdAt": serialize.iso(row["created_at"]), "sender": serialize.public_user(row)}
        for row in rows
    ]
    return {"requests": requests}


@router.post("/friend-requests", status_code=201)
def send_request(request: Request, user=Depends(get_current_user)):
    receiver_id = validation.friend_request(request.state.json_body)
    if receiver_id == user["id"] or not users.find_by_id(receiver_id):
        raise ApiError(404, "Usuario no encontrado")
    try:
        request_id = friendships.create_request(user["id"], receiver_id)
    except UniqueViolation:
        raise ApiError(409, "Ya existe una solicitud o amistad con este usuario")
    return {"request": {"id": request_id}}


@router.post("/friend-requests/{request_id}/accept")
def accept_request(request_id: str, user=Depends(get_current_user)):
    if not friendships.accept(validation.identifier(request_id), user["id"]):
        raise ApiError(404, "Solicitud no encontrada")
    return {"message": "Solicitud aceptada"}


@router.post("/friend-requests/{request_id}/reject")
def reject_request(request_id: str, user=Depends(get_current_user)):
    if not friendships.reject(validation.identifier(request_id), user["id"]):
        raise ApiError(404, "Solicitud no encontrada")
    return {"message": "Solicitud rechazada"}
