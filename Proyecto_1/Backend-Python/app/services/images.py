import json
import logging
import urllib.error
import urllib.request
from .. import config
from ..errors import ApiError

PROFILE_FOLDER = "Fotos_Perfil"
POSTS_FOLDER = "Fotos_Publicadas"
UPLOAD_TIMEOUT_SECONDS = 30


# La carga pasa obligatoriamente por API Gateway, que dispara la Lambda upload-image.
def upload(folder, image):
    payload = json.dumps({"folder": folder, "contentType": image["content_type"], "data": image["data"]})
    request = urllib.request.Request(
        config.IMAGE_UPLOAD_URL,
        data=payload.encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json", "x-api-key": config.IMAGE_UPLOAD_API_KEY},
    )
    try:
        with urllib.request.urlopen(request, timeout=UPLOAD_TIMEOUT_SECONDS) as response:
            key = json.loads(response.read()).get("key")
    except (urllib.error.URLError, ValueError) as error:
        logging.error("API Gateway rechazo la imagen: %s", error)
        key = None
    if not key:
        raise ApiError(502, "No se pudo subir la imagen")
    return key
