from fastapi import APIRouter, Depends, Request
from .. import validation
from ..dependencies import get_current_user
from ..errors import ApiError
from ..repositories import friendships, messages

router = APIRouter(prefix="/chat")


def validated_friend_id(user, friend_id):
    identifier = validation.identifier(friend_id, "friendId")
    if not friendships.are_friends(user["id"], identifier):
        raise ApiError(403, "Solo puedes chatear con tus amigos")
    return identifier


@router.get("/{friend_id}/messages")
def list_messages(friend_id: str, user=Depends(get_current_user)):
    identifier = validated_friend_id(user, friend_id)
    return {"messages": messages.conversation(user["id"], identifier)}


# El mensaje llega al amigo por WebSocket cuando el ChatGateway lo detecta en RDS.
@router.post("/{friend_id}/messages", status_code=201)
def send_message(friend_id: str, request: Request, user=Depends(get_current_user)):
    identifier = validated_friend_id(user, friend_id)
    content = validation.content(request.state.json_body, 2000)
    return {"message": messages.create(user["id"], identifier, content)}
