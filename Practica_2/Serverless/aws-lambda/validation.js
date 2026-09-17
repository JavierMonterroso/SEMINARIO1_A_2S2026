const MAX_FILE_SIZE = 5 * 1024 * 1024;
function problem(status, message) { const error = new Error(message); error.status = status; throw error; }
function validate(body, imageOnly) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) problem(400, 'JSON invalido');
  const { fileName, contentType, data } = body;
  if (typeof fileName !== 'string' || !fileName.trim() || [...fileName.trim()].length > 255 || fileName.includes('\0')) problem(400, "El campo 'fileName' es obligatorio o invalido");
  if (typeof contentType !== 'string' || contentType.length > 100 || !/^[\w.+-]+\/[\w.+-]+$/.test(contentType) || (imageOnly && !contentType.startsWith('image/'))) problem(400, "El campo 'contentType' es obligatorio o invalido");
  if (typeof data !== 'string' || !data || data.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) problem(400, "El campo 'data' es obligatorio o invalido");
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.toString('base64') !== data) problem(400, "El campo 'data' es obligatorio o invalido");
  if (buffer.length > MAX_FILE_SIZE) problem(413, 'El archivo supera el limite de 5 MB');
  return { fileName: fileName.trim().replace(/[\\/]/g, '_'), contentType, buffer };
}
module.exports = { validate, problem };
