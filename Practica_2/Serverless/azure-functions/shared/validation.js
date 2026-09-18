const MAX_FILE_SIZE = 5 * 1024 * 1024;
function problem(status, message) { const error = new Error(message); error.status = status; throw error; }
function validateFileName(filename) {
  if (typeof filename !== 'string' || !filename.trim() || [...filename.trim()].length > 255 || filename.includes('\0')) problem(400, "El campo 'filename' es obligatorio o invalido");
  return filename.trim().replace(/[\\/]/g, '_');
}
function validate(body, imageOnly) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) problem(400, 'JSON invalido');
  const fileName = validateFileName(body.filename);
  if (imageOnly) {
    const { contentType, image } = body;
    if (typeof contentType !== 'string' || contentType.length > 100 || !/^[\w.+-]+\/[\w.+-]+$/.test(contentType) || !contentType.startsWith('image/')) problem(400, "El campo 'contentType' es obligatorio o invalido");
    if (typeof image !== 'string' || !image || image.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(image)) problem(400, "El campo 'image' es obligatorio o invalido");
    const buffer = Buffer.from(image, 'base64');
    if (!buffer.length || buffer.toString('base64') !== image) problem(400, "El campo 'image' es obligatorio o invalido");
    if (buffer.length > MAX_FILE_SIZE) problem(413, 'El archivo supera el limite de 5 MB');
    return { fileName, contentType, buffer };
  }
  const { content } = body;
  if (typeof content !== 'string' || !content) problem(400, "El campo 'content' es obligatorio o invalido");
  const buffer = Buffer.from(content, 'utf8');
  if (buffer.length > MAX_FILE_SIZE) problem(413, 'El archivo supera el limite de 5 MB');
  return { fileName, contentType: 'text/plain', buffer };
}
module.exports = { validate, problem };
