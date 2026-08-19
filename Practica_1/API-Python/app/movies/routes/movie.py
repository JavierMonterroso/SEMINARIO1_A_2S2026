from fastapi import APIRouter, HTTPException

from app.movies.repositories.movie import get_all_movies, get_movie_by_id
from app.movies.schemas.movie import MovieResponse

router = APIRouter(
    tags=["Movies"]
)

@router.get("/movies", response_model=list[MovieResponse])
def list_movies():
    return get_all_movies()

@router.get("/movies/{id_pelicula}", response_model=MovieResponse)
def get_movie(id_pelicula: int):
    if id_pelicula < 1:
        raise HTTPException(
            status_code=400,
            detail="Datos de solicitud inválidos"
        )

    movie = get_movie_by_id(id_pelicula)

    if not movie:
        raise HTTPException(
            status_code=404, 
            detail="Pelicula no encontrada"
        )
    
    return movie
