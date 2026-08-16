
from datetime import datetime

from pydantic import BaseModel


class PlaylistAdd(BaseModel):
    id_pelicula: int


class PlaylistResponse(BaseModel):
    id_lista: int
    id_usuario: int
    id_pelicula: int
    fecha_agregado: datetime


class PlaylistMovieResponse(BaseModel):
    id_lista: int
    id_usuario: int
    id_pelicula: int
    titulo: str
    director: str
    anio_estreno: int
    url_contenido: str
    poster: str
    estado: str
    fecha_agregado: datetime