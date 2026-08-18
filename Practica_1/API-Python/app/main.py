from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import get_connection
from app.movies.routes.movie import router as movie_router
from app.users.routes.user import router as user_router
from app.playlist.routes.playlist import router as playlist_router
from app.uploads.routes import router as upload_router


app = FastAPI(
    title="CloudCinema API",
    description="API del backend Python para CloudCinema",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(movie_router)
app.include_router(user_router)
app.include_router(playlist_router)
app.include_router(upload_router)


# Espejo del manejador global de errores de la API Node (server.js) - ante
# una excepcion no controlada, ambas deben responder el mismo formato en
# vez de que cada una filtre un error distinto detras del balanceador.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )


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