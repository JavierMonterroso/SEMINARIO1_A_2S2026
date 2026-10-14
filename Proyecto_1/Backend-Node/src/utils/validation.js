const HttpError = require('./http-error');

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_ID = 2147483647;
const IMAGE_DATA_URL = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/]+={0,2})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DPI_PATTERN = /^\d{13}$/;
const LANGUAGES = ['es', 'en', 'fr', 'pt'];

function fail(field) {
  throw new HttpError(400, `El campo '${field}' es obligatorio o inválido`);
}

function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('body');
  return value;
}

function text(value, field, max) {
  if (typeof value !== 'string' || value.includes('\0')) fail(field);
  const result = value.trim();
  if (!result || [...result].length > max) fail(field);
  return result;
}

function optionalText(value, field, max) {
  const isBlank = value === undefined || value === null || (typeof value === 'string' && !value.trim());
  return isBlank ? null : text(value, field, max);
}

function email(value) {
  const result = text(value, 'email', 255).toLowerCase();
  if (!EMAIL_PATTERN.test(result)) fail('email');
  return result;
}

function dpi(value) {
  const result = text(value, 'dpi', 13);
  if (!DPI_PATTERN.test(result)) fail('dpi');
  return result;
}

// Las reglas de complejidad las aplica la politica de contrasenas de Cognito.
function password(value, field) {
  if (typeof value !== 'string' || !value || value.length > 256) fail(field);
  return value;
}

function image(value, field) {
  const match = typeof value === 'string' ? IMAGE_DATA_URL.exec(value) : null;
  if (!match) fail(field);
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    throw new HttpError(400, 'La imagen debe pesar como máximo 4 MB');
  }
  return { contentType: match[1], data: match[2], bytes };
}

function id(value, field = 'id') {
  const result = typeof value === 'string' && /^[1-9]\d{0,9}$/.test(value) ? Number(value) : value;
  if (!Number.isInteger(result) || result < 1 || result > MAX_ID) fail(field);
  return result;
}

function language(value, field) {
  if (!LANGUAGES.includes(value)) fail(field);
  return value;
}

function register(value) {
  object(value);
  const plain = password(value.password, 'password');
  if (plain !== value.confirmPassword) throw new HttpError(400, 'Las contraseñas no coinciden');
  return {
    fullName: text(value.fullName, 'fullName', 150),
    email: email(value.email),
    dpi: dpi(value.dpi),
    password: plain,
    photo: image(value.photo, 'photo'),
  };
}

function confirmation(value) {
  object(value);
  return { email: email(value.email), code: text(value.code, 'code', 10) };
}

function emailOnly(value) {
  object(value);
  return { email: email(value.email) };
}

function login(value) {
  object(value);
  return { email: email(value.username), password: password(value.password, 'password') };
}

function faceLogin(value) {
  object(value);
  return { email: email(value.username), photo: image(value.photo, 'photo') };
}

function profile(value) {
  object(value);
  return {
    fullName: text(value.fullName, 'fullName', 150),
    dpi: dpi(value.dpi),
    password: password(value.password, 'password'),
    photo: value.photo ? image(value.photo, 'photo') : null,
  };
}

function post(value) {
  object(value);
  return {
    description: optionalText(value.description, 'description', 2000),
    image: image(value.image, 'image'),
  };
}

function postFilter(query) {
  return {
    label: optionalText(query.label, 'label', 100),
    search: optionalText(query.search, 'search', 100),
  };
}

function content(value, max) {
  object(value);
  return text(value.content, 'content', max);
}

function friendRequest(value) {
  object(value);
  return id(value.receiverId, 'receiverId');
}

function translation(value) {
  object(value);
  return {
    text: text(value.text, 'text', 5000),
    targetLanguage: language(value.targetLanguage, 'targetLanguage'),
  };
}

function speech(value) {
  object(value);
  return {
    text: text(value.text, 'text', 3000),
    language: value.language ? language(value.language, 'language') : null,
  };
}

function chatbotMessage(value) {
  object(value);
  return text(value.message, 'message', 1024);
}

module.exports = {
  register, confirmation, emailOnly, login, faceLogin, profile,
  post, postFilter, content, friendRequest, translation, speech, chatbotMessage, id,
};
