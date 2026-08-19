import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field


EMAIL_REGEX = re.compile(
    r"^[A-Za-z0-9]+(?:[._%+-][A-Za-z0-9]+)*@"
    r"[A-Za-z0-9]+(?:[.-][A-Za-z0-9]+)*\.[A-Za-z]{2,}$"
)


def validate_email(value: str) -> str:
    if len(value) > 254 or EMAIL_REGEX.fullmatch(value) is None:
        raise ValueError("Correo electrónico inválido")

    return value


Email = Annotated[str, AfterValidator(validate_email)]


class UserRegister(BaseModel):
    correo: Email
    nombre_completo: str = Field(
        min_length=1,
        max_length=150
    )
    contrasena: str = Field(
        min_length=4,
        max_length=128
    )
    foto_perfil: str = Field(
        min_length=1,
        max_length=500
    )


class UserLogin(BaseModel):
    correo: Email
    contrasena: str = Field(
        min_length=4,
        max_length=128
    )


class UserUpdate(BaseModel):
    contrasena_actual: str = Field(
        min_length=4,
        max_length=128
    )
    nombre_completo: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )
    foto_perfil: str | None = Field(
        default=None,
        min_length=1,
        max_length=500
    )


class UserResponse(BaseModel):
    id_usuario: int
    correo: str
    nombre_completo: str
    foto_perfil: str
