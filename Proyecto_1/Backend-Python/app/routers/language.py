from fastapi import APIRouter, Depends, Request
from .. import validation
from ..dependencies import get_current_user
from ..services import chatbot, language

router = APIRouter()


@router.post("/translate")
def translate(request: Request, user=Depends(get_current_user)):
    data = validation.translation(request.state.json_body)
    return language.translate(data["text"], data["target_language"])


@router.post("/speech")
def speech(request: Request, user=Depends(get_current_user)):
    data = validation.speech(request.state.json_body)
    return {"audioUrl": language.speech_url(data["text"], data["language"])}


@router.post("/chatbot")
def ask_chatbot(request: Request, user=Depends(get_current_user)):
    message = validation.chatbot_message(request.state.json_body)
    return {"messages": chatbot.ask(user["id"], message)}
