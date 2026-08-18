from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    correo: EmailStr
    nombre_completo: str
    contrasena: str
    foto_perfil: str


class UserLogin(BaseModel):
    correo: EmailStr
    contrasena: str


class UserUpdate(BaseModel):
    contrasena_actual: str
    nombre_completo: str | None = None
    foto_perfil: str | None = None


class UserResponse(BaseModel):
    id_usuario: int
    correo: EmailStr
    nombre_completo: str
    foto_perfil: str
