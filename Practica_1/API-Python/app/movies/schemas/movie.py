from pydantic import BaseModel

class MovieResponse(BaseModel):
    id_pelicula: int
    titulo: str
    director: str
    anio_estreno: int
    url_contenido: str
    poster: str
    estado: str