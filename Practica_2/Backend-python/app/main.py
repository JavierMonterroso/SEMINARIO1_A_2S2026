from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from .routers import auth, tasks, files

app = FastAPI(title="TaskFlow + CloudDrive - Backend Python")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Reescribi el formato de error de FastAPI (que por defecto usa "detail") para que
# coincida con el backend de Node, que siempre responde {"error": "mensaje"}.
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


# Hice que los campos faltantes o invalidos respondan 400 igual que en Node,
# en lugar del 422 con formato de lista que genera Pydantic por defecto.
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    field = first_error["loc"][-1]
    return JSONResponse(status_code=400, content={"error": f"El campo '{field}' es obligatorio o invalido"})


@app.get("/api/health")
def health():
    return {"status": "ok", "server": "python"}


app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(files.router, prefix="/api")
