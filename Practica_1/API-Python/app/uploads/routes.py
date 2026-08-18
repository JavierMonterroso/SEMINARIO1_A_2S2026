from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.s3 import upload_image

router = APIRouter(tags=["Uploads"])

FOLDERS = {
    "perfil": "Fotos_Perfil",
    "pelicula": "Fotos_Peliculas"
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB, mismo limite que multer en la API Node


# No es parte del contrato compartido con la API Node.js (que recibe
# foto_perfil ya como string en /register y /users/{id}). Este endpoint
# existe para que el frontend suba el archivo real a S3 primero y obtenga
# la ruta relativa, igual que su equivalente en la API Node.js.
@router.post("/uploads/{tipo}", status_code=status.HTTP_201_CREATED)
def upload_file(tipo: str, file: UploadFile = File(...)):
    folder = FOLDERS.get(tipo)

    if folder is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Tipo de imagen inválido (usar "perfil" o "pelicula")'
        )

    if file.size is not None and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo no debe superar los 5 MB"
        )

    path = upload_image(file, folder)

    return {"path": path}
