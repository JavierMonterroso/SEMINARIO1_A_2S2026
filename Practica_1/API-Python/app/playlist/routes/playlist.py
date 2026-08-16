from fastapi import APIRouter, HTTPException, status

from app.movies.repositories.movie import get_movie_by_id
from app.playlist.repositories.playlist import (
    add_movie_to_playlist,
    get_playlist_item,
    get_user_playlist,
    delete_movie_from_playlist
)
from app.playlist.schemas.playlist import (
    PlaylistAdd,
    PlaylistResponse,
    PlaylistMovieResponse
)
from app.users.repositories.user import get_user_by_id


router = APIRouter(
    tags=["Playlist"]
)


@router.post(
    "/users/{id_usuario}/playlist",
    response_model=PlaylistResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_playlist(
    id_usuario: int,
    item: PlaylistAdd
):
    user = get_user_by_id(id_usuario)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    movie = get_movie_by_id(item.id_pelicula)

    if movie is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Película no encontrada"
        )

    existing_item = get_playlist_item(
        id_usuario,
        item.id_pelicula
    )

    if existing_item is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La película ya está en la lista de reproducción"
        )

    return add_movie_to_playlist(
        id_usuario,
        item.id_pelicula
    )


@router.get(
    "/users/{id_usuario}/playlist",
    response_model=list[PlaylistMovieResponse]
)
def get_playlist(id_usuario: int):
    user = get_user_by_id(id_usuario)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return get_user_playlist(id_usuario)


@router.delete(
    "/users/{id_usuario}/playlist/{id_pelicula}"
)
def delete_from_playlist(
    id_usuario: int,
    id_pelicula: int
):
    user = get_user_by_id(id_usuario)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    movie = get_movie_by_id(id_pelicula)

    if movie is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Película no encontrada"
        )

    deleted_item = delete_movie_from_playlist(
        id_usuario,
        id_pelicula
    )

    if deleted_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La película no está en la lista de reproducción"
        )

    return {
        "message": "Película eliminada de la lista de reproducción"
    }