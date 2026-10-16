from fastapi import APIRouter, Depends, Request
from .. import validation
from ..dependencies import get_current_user
from ..errors import ApiError
from ..repositories import posts
from ..services import images, rekognition

router = APIRouter()


@router.get("/posts")
def list_posts(request: Request, user=Depends(get_current_user)):
    post_filter = validation.post_filter(request.query_params)
    return {"posts": posts.feed(user["id"], post_filter)}


@router.get("/labels")
def list_labels(user=Depends(get_current_user)):
    return {"labels": posts.visible_labels(user["id"])}


@router.post("/posts", status_code=201)
def create_post(request: Request, user=Depends(get_current_user)):
    data = validation.post(request.state.json_body)
    image_key = images.upload(images.POSTS_FOLDER, data["image"])
    labels = rekognition.detect_labels(image_key)
    post_id = posts.create({
        "user_id": user["id"],
        "description": data["description"],
        "image_key": image_key,
        "labels": labels,
    })
    return {"post": posts.find_by_id(post_id)}


@router.post("/posts/{post_id}/comments", status_code=201)
def create_comment(post_id: str, request: Request, user=Depends(get_current_user)):
    identifier = validation.identifier(post_id)
    content = validation.content(request.state.json_body, 1000)
    comment = posts.create_comment(identifier, user["id"], content)
    if not comment:
        raise ApiError(404, "Publicación no encontrada")
    return {"comment": comment}
