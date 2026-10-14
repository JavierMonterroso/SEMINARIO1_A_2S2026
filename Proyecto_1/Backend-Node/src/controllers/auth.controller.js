const validation = require('../utils/validation');
const serialize = require('../utils/serialize');
const HttpError = require('../utils/http-error');
const { md5 } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const users = require('../repositories/users.repository');
const cognito = require('../services/cognito.service');
const images = require('../services/image.service');
const rekognition = require('../services/rekognition.service');

const FACE_MISMATCH = 'El rostro no coincide con la foto de perfil';

function session(user) {
  return { token: signToken(user), user: serialize.ownUser(user) };
}

async function register(req, res) {
  const data = validation.register(req.body);
  if (await users.isEmailOrDpiTaken(data.email, data.dpi)) {
    throw new HttpError(409, 'El correo o el DPI ya están registrados');
  }

  const cognitoSub = await cognito.signUp(data);
  try {
    const photoKey = await images.upload(images.PROFILE_FOLDER, data.photo);
    await users.create({ ...data, cognitoSub, photoKey, passwordHash: md5(data.password) });
  } catch (error) {
    // Sin este rollback el correo quedaria ocupado en Cognito sin usuario en RDS.
    await cognito.deleteUser(data.email);
    throw error;
  }
  return res.status(201).json({ message: 'Te enviamos un código de verificación a tu correo', email: data.email });
}

async function confirm(req, res) {
  const { email, code } = validation.confirmation(req.body);
  await cognito.confirmSignUp(email, code);
  return res.json({ message: 'Correo verificado, ya puedes iniciar sesión' });
}

async function resendCode(req, res) {
  const { email } = validation.emailOnly(req.body);
  await cognito.resendCode(email);
  return res.json({ message: 'Te enviamos un nuevo código de verificación' });
}

async function login(req, res) {
  const { email, password } = validation.login(req.body);
  await cognito.authenticate(email, password);
  const user = await users.findByEmail(email);
  if (!user) throw new HttpError(401, 'Usuario o contraseña incorrectos');
  return res.json(session(user));
}

async function faceLogin(req, res) {
  const { email, photo } = validation.faceLogin(req.body);
  const user = await users.findByEmail(email);
  if (!user) throw new HttpError(401, FACE_MISMATCH);
  if (!(await rekognition.facesMatch(photo.bytes, user.photo_key))) throw new HttpError(401, FACE_MISMATCH);
  if (!(await cognito.isConfirmed(email))) {
    throw new HttpError(403, 'Debes verificar tu correo antes de iniciar sesión', 'USER_NOT_CONFIRMED');
  }
  return res.json(session(user));
}

module.exports = { register, confirm, resendCode, login, faceLogin };
