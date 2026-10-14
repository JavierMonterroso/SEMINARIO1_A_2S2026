import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Recibe { folder, contentType, data } desde API Gateway y guarda la imagen en S3.
// Runtime: Node.js 20.x. El SDK v3 ya viene incluido en el runtime de Lambda.

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_FOLDERS = ['Fotos_Perfil', 'Fotos_Publicadas'];
const EXTENSION_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png' };

const s3 = new S3Client({});

export async function handler(event) {
  try {
    const image = parseImage(event);
    const key = `${image.folder}/${randomUUID()}.${EXTENSION_BY_TYPE[image.contentType]}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: image.bytes,
      ContentType: image.contentType,
    }));
    return response(201, { key });
  } catch (error) {
    if (error.statusCode) return response(error.statusCode, { error: error.message });
    console.error('Error al guardar la imagen:', error.name);
    return response(500, { error: 'No se pudo guardar la imagen' });
  }
}

function parseImage(event) {
  const body = parseBody(event);
  if (!ALLOWED_FOLDERS.includes(body.folder)) throw badRequest('Carpeta no permitida');
  if (!EXTENSION_BY_TYPE[body.contentType]) throw badRequest('Solo se permiten imagenes JPEG o PNG');
  if (typeof body.data !== 'string' || !body.data) throw badRequest('Falta la imagen');

  const bytes = Buffer.from(body.data, 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw badRequest('La imagen debe pesar como maximo 4 MB');
  return { folder: body.folder, contentType: body.contentType, bytes };
}

function parseBody(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body;
  try {
    const body = JSON.parse(raw || '{}');
    if (body && typeof body === 'object') return body;
  } catch {
    // Se responde abajo con el mismo error que un cuerpo vacio.
  }
  throw badRequest('JSON invalido');
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
