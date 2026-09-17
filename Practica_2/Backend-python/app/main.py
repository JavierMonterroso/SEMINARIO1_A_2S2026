import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from psycopg2.errors import UniqueViolation
from . import config, database
from .routers import auth, tasks, files


@asynccontextmanager
async def lifespan(app):
    config.validate()
    database.initialize()
    try:
        yield
    finally:
        database.close()


app = FastAPI(title="TaskFlow + CloudDrive", lifespan=lifespan, redirect_slashes=False)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def error(status, message):
    return JSONResponse(status_code=status, content={"error": message}, headers={"X-Backend": "python", "Access-Control-Allow-Origin": "*"})


def invalid_constant(value):
    raise ValueError("JSON invalido")


@app.middleware("http")
async def normalize_request(request: Request, call_next):
    # Aceptar las mismas rutas con o sin barra final, sin redirecciones.
    request.scope["path"] = request.scope["path"].rstrip("/") or "/"
    if request.method in ("POST", "PUT", "PATCH"):
        content_type = request.headers.get("content-type", "").split(";")[0].strip().lower()
        if content_type != "application/json":
            return error(415, "Se requiere Content-Type application/json")
        raw = await request.body()
        if len(raw) > 8 * 1024 * 1024:
            return error(413, "La solicitud supera el limite de 8 MB")
        try:
            body = json.loads(raw or b"{}", parse_constant=invalid_constant)
            if not isinstance(body, dict):
                raise ValueError("JSON invalido")
            request.state.json_body = body
        except (ValueError, UnicodeDecodeError):
            return error(400, "JSON invalido")
    response = await call_next(request)
    response.headers["X-Backend"] = "python"
    return response


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    if exc.status_code in (404, 405) and exc.detail in ("Not Found", "Method Not Allowed"):
        return error(404, "Ruta no encontrada")
    return error(exc.status_code, exc.detail)


@app.exception_handler(UniqueViolation)
async def duplicate_user(request: Request, exc: UniqueViolation):
    return error(409, "El nombre de usuario ya existe")


@app.exception_handler(Exception)
async def internal_error(request: Request, exc: Exception):
    logging.error("Error interno: %s", type(exc).__name__)
    return error(500, "Error interno del servidor")


@app.get("/api/health")
def health():
    try:
        conn = database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
            return {"status": "ok"}
        finally:
            database.release_connection(conn)
    except Exception:
        return error(503, "Base de datos no disponible")


app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(files.router, prefix="/api")
