from fastapi import APIRouter, Depends, Request
from .. import serialize, validation
from ..dependencies import get_current_user
from ..errors import ApiError
from ..repositories import users
from ..services import cognito, images

router = APIRouter(prefix="/users")


def current_user(token_user):
    user = users.find_by_id(token_user["id"])
    if not user:
        raise ApiError(401, "El usuario ya no existe")
    return user


def verify_password(email, password):
    try:
        cognito.authenticate(email, password)
    except ApiError as error:
        if error.status == 401:
            raise ApiError(401, "La contraseña es incorrecta")
        raise


@router.get("/me")
def get_me(token_user=Depends(get_current_user)):
    return {"user": serialize.own_user(current_user(token_user))}


@router.put("/me")
def update_me(request: Request, token_user=Depends(get_current_user)):
    data = validation.profile(request.state.json_body)
    user = current_user(token_user)
    verify_password(user["email"], data["password"])
    if users.is_dpi_taken_by_another_user(data["dpi"], user["id"]):
        raise ApiError(409, "El DPI ya está registrado")

    photo_key = images.upload(images.PROFILE_FOLDER, data["photo"]) if data["photo"] else user["photo_key"]
    cognito.update_profile(user["email"], data)
    updated = users.update_profile(user["id"], {"full_name": data["full_name"], "dpi": data["dpi"], "photo_key": photo_key})
    return {"user": serialize.own_user(updated)}
