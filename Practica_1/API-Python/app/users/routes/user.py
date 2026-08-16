from fastapi import APIRouter, HTTPException, status

from app.users.repositories.user import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_profile
)
from app.users.schemas.user import (
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdate
)
from app.users.security import hash_password_md5


router = APIRouter(
    tags=["Users"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(user: UserRegister):
    existing_user = get_user_by_email(user.correo)

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado"
        )

    hashed_password = hash_password_md5(user.contrasena)

    new_user = create_user(
        correo=user.correo,
        nombre_completo=user.nombre_completo,
        contrasena=hashed_password,
        foto_perfil=user.foto_perfil
    )

    return new_user


@router.post("/login")
def login_user(user: UserLogin):
    existing_user = get_user_by_email(user.correo)

    if existing_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    hashed_password = hash_password_md5(user.contrasena)

    if existing_user["contrasena"] != hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    return {
        "message": "Inicio de sesión exitoso",
        "user": {
            "id_usuario": existing_user["id_usuario"],
            "correo": existing_user["correo"],
            "nombre_completo": existing_user["nombre_completo"],
            "foto_perfil": existing_user["foto_perfil"]
        }
    }


@router.get(
    "/users/{id_usuario}",
    response_model=UserResponse
)
def get_user(id_usuario: int):
    user = get_user_by_id(id_usuario)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return user


@router.patch(
    "/users/{id_usuario}",
    response_model=UserResponse
)
def edit_user_profile(
    id_usuario: int,
    user: UserUpdate
):
    if (
        user.nombre_completo is None
        and user.foto_perfil is None
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe enviar al menos un campo para actualizar"
        )

    updated_user = update_user_profile(
        id_usuario=id_usuario,
        nombre_completo=user.nombre_completo,
        foto_perfil=user.foto_perfil
    )

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return updated_user