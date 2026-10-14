const { config } = require('../config/env');
const HttpError = require('../utils/http-error');

const PROFILE_FOLDER = 'Fotos_Perfil';
const POSTS_FOLDER = 'Fotos_Publicadas';

// La carga pasa obligatoriamente por API Gateway, que dispara la Lambda upload-image.
async function upload(folder, image) {
  const response = await fetch(config.images.uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': config.images.uploadApiKey },
    body: JSON.stringify({ folder, contentType: image.contentType, data: image.data }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.key) {
    console.error('API Gateway rechazo la imagen:', response.status);
    throw new HttpError(502, 'No se pudo subir la imagen');
  }
  return body.key;
}

module.exports = { upload, PROFILE_FOLDER, POSTS_FOLDER };
