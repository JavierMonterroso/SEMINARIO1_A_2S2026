// Las imagenes se reducen y se convierten a JPEG antes de enviarlas para no superar
// el limite de 4 MB de la Lambda de carga.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export function isAcceptedImage(file) {
  return ACCEPTED_TYPES.includes(file.type);
}

export async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  return drawAsJpeg(bitmap, bitmap.width, bitmap.height);
}

export function videoFrameToDataUrl(video) {
  return drawAsJpeg(video, video.videoWidth, video.videoHeight);
}

function drawAsJpeg(source, width, height) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
