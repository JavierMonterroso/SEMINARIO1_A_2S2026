from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    correo: EmailStr
    nombre_completo: str
    contrasena: str
    foto_perfil: str


class UserLogin(BaseModel):
    correo: EmailStr
    contrasena: str


class UserUpdate(BaseModel):
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
    correo: EmailStr
    nombre_completo: str
    foto_perfil: str