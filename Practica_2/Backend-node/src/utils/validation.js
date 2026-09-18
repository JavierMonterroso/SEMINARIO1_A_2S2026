function fail(field) {
  const error = new Error(`El campo '${field}' es obligatorio o invalido`);
  error.status = 400;
  throw error;
}

function object(value, field = 'body') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field);
  return value;
}

function text(value, field, max, { trim = true, empty = false } = {}) {
  if (typeof value !== 'string' || value.includes('\0')) fail(field);
  const result = trim ? value.trim() : value;
  if ((!empty && !result) || [...result].length > max) fail(field);
  return result;
}

function password(value, field) {
  const result = text(value, field, 72, { trim: false });
  if (Buffer.byteLength(result, 'utf8') > 72) fail(field);
  return result;
}

function publicUrl(value, field) {
  const result = text(value, field, 4096);
  if (!/^https?:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/.test(result)) fail(field);
  try {
    const parsed = new URL(result);
    if (!parsed.hostname || parsed.username || parsed.password) fail(field);
  } catch {
    fail(field);
  }
  return result;
}

function register(value) {
  object(value);
  const username = text(value.username, 'username', 50);
  const email = text(value.email, 'email', 255);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('email');
  const plain = password(value.password, 'password');
  const confirm = password(value.confirmPassword, 'confirmPassword');
  if (plain !== confirm) {
    const error = new Error('Las contrasenas no coinciden');
    error.status = 400;
    throw error;
  }
  return { username, email, password: plain, profileImageUrl: publicUrl(value.profileImageUrl, 'profileImageUrl') };
}

function login(value) {
  object(value);
  return { username: text(value.username, 'username', 50), password: password(value.password, 'password') };
}

function task(value, update = false) {
  object(value);
  const result = {};
  if (!update || Object.hasOwn(value, 'title')) result.title = text(value.title, 'title', 150);
  if (Object.hasOwn(value, 'description')) {
    result.description = value.description === null ? null : text(value.description, 'description', 10000, { trim: false, empty: true });
  } else if (!update) result.description = null;
  if (update && !Object.keys(result).length) fail('body');
  return result;
}

function complete(value) {
  object(value);
  if (typeof value.completed !== 'boolean') fail('completed');
  return value.completed;
}

function file(value) {
  object(value);
  const name = text(value.name, 'name', 255);
  const type = text(value.type, 'type', 100);
  const url = publicUrl(value.url, 'url');
  if (!/^[\w.+-]+\/[\w.+-]+$/.test(type)) fail('type');
  if (!type.startsWith('image/') && (type !== 'text/plain' || !name.toLowerCase().endsWith('.txt'))) fail('type');
  return { name, type, url };
}

function id(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value) || Number(value) > 2147483647) fail('id');
  return Number(value);
}

module.exports = { register, login, task, complete, file, id };
