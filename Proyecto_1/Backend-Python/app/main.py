import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from . import config, database, security
from .errors import ApiError
from .realtime import ChatGateway
from .repositories import messages
from .routers import auth, chat, friends, language, posts, users

MAX_BODY_BYTES = 8 * 1024 * 1024
BODY_METHODS = ("POST", "PUT", "PATCH")

chat_gateway = ChatGateway(security.verify_token, messages)


@asynccontextmanager
async def lifespan(app):
    config.validate()
    database.initialize()
    await chat_gateway.start()
    try:
        yield
    finally:
        await chat_gateway.stop()
        database.close()


app = FastAPI(title="Semi-Social", lifespan=lifespan, redirect_slashes=False)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def error(status, message, code=None):
    content = {"error": message} if code is None else {"error": message, "code": code}
    return JSONResponse(status_code=status, content=content, headers={"X-Backend": "python", "Access-Control-Allow-Origin": "*"})


def invalid_constant(value):
    raise ValueError("JSON invalido")


@app.middleware("http")
async def parse_json_body(request: Request, call_next):
    # Aceptar las mismas rutas con o sin barra final, igual que Express.
    request.scope["path"] = request.scope["path"].rstrip("/") or "/"
    if request.method in BODY_METHODS:
        content_type = request.headers.get("content-type", "").split(";")[0].strip().lower()
        if content_type != "application/json":
            return error(415, "Se requiere Content-Type application/json")
        raw = await request.body()
        if len(raw) > MAX_BODY_BYTES:
            return error(413, "La solicitud supera el límite de 8 MB")
        try:
            request.state.json_body = json.loads(raw or b"{}", parse_constant=invalid_constant)
        except (ValueError, UnicodeDecodeError):
            return error(400, "JSON inválido")
    response = await call_next(request)
    response.headers["X-Backend"] = "python"
    return response


@app.exception_handler(ApiError)
async def api_error(request: Request, exc: ApiError):
    return error(exc.status, exc.message, exc.code)


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    if exc.status_code in (404, 405):
        return error(404, "Ruta no encontrada")
    return error(exc.status_code, exc.detail)


@app.exception_handler(Exception)
async def internal_error(request: Request, exc: Exception):
    # No imprimir credenciales ni los datos completos de una solicitud.
    logging.error("Error interno: %s %s", type(exc).__name__, exc)
    return error(500, "Error interno del servidor")


@app.get("/api/health")
def health():
    try:
        database.fetch_one("SELECT 1")
        return {"status": "ok", "backend": "python"}
    except Exception:
        return error(503, "Base de datos no disponible")


@app.websocket("/ws")
async def chat_socket(websocket: WebSocket):
    await chat_gateway.accept(websocket)


for router in (auth.router, users.router, friends.router, posts.router, language.router, chat.router):
    app.include_router(router, prefix="/api")
