from fastapi import APIRouter, Request
from .. import security, serialize, validation
from ..errors import ApiError
from ..repositories import users
from ..services import cognito, images, rekognition

router = APIRouter(prefix="/auth")

FACE_MISMATCH = "El rostro no coincide con la foto de perfil"


def session(user):
    return {"token": security.sign_token(user), "user": serialize.own_user(user)}


@router.post("/register", status_code=201)
def register(request: Request):
    data = validation.register(request.state.json_body)
    if users.is_email_or_dpi_taken(data["email"], data["dpi"]):
        raise ApiError(409, "El correo o el DPI ya están registrados")

    cognito_sub = cognito.sign_up(data)
    try:
        photo_key = images.upload(images.PROFILE_FOLDER, data["photo"])
        users.create({
            "cognito_sub": cognito_sub,
            "full_name": data["full_name"],
            "email": data["email"],
            "dpi": data["dpi"],
            "password_hash": security.md5(data["password"]),
            "photo_key": photo_key,
        })
    except Exception:
        # Sin este rollback el correo quedaria ocupado en Cognito sin usuario en RDS.
        cognito.delete_user(data["email"])
        raise
    return {"message": "Te enviamos un código de verificación a tu correo", "email": data["email"]}


@router.post("/confirm")
def confirm(request: Request):
    data = validation.confirmation(request.state.json_body)
    cognito.confirm_sign_up(data["email"], data["code"])
    return {"message": "Correo verificado, ya puedes iniciar sesión"}


@router.post("/resend-code")
def resend_code(request: Request):
    cognito.resend_code(validation.email_only(request.state.json_body))
    return {"message": "Te enviamos un nuevo código de verificación"}


@router.post("/login")
def login(request: Request):
    data = validation.login(request.state.json_body)
    cognito.authenticate(data["email"], data["password"])
    user = users.find_by_email(data["email"])
    if not user:
        raise ApiError(401, "Usuario o contraseña incorrectos")
    return session(user)


@router.post("/face-login")
def face_login(request: Request):
    data = validation.face_login(request.state.json_body)
    user = users.find_by_email(data["email"])
    if not user or not rekognition.faces_match(data["photo"]["bytes"], user["photo_key"]):
        raise ApiError(401, FACE_MISMATCH)
    if not cognito.is_confirmed(data["email"]):
        raise ApiError(403, "Debes verificar tu correo antes de iniciar sesión", "USER_NOT_CONFIRMED")
    return session(user)
