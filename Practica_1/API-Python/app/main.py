from fastapi import FastAPI

from app.database import get_connection
from app.movies.routes.movie import router as movie_router
from app.users.routes.user import router as user_router
from app.playlist.routes.playlist import router as playlist_router


app = FastAPI(
    title="CloudCinema API",
    description="API del backend Python para CloudCinema",
    version="1.0.0"
)


app.include_router(movie_router)
app.include_router(user_router)
app.include_router(playlist_router)


@app.get("/")
def root():
    return {
        "message": "CloudCinema API",
        "documentation": "/docs"
    }


@app.get("/check")
def check():
    return {
        "status": "OK",
        "backend": "Python FastAPI"
    }


@app.get("/db-check")
def db_check():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT NOW();")
            server_time = cursor.fetchone()[0]

    return {
        "status": "OK",
        "database": "PostgreSQL",
        "server_time": server_time
    }