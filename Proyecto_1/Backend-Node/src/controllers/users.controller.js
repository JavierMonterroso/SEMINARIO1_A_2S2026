const validation = require('../utils/validation');
const serialize = require('../utils/serialize');
const HttpError = require('../utils/http-error');
const users = require('../repositories/users.repository');
const cognito = require('../services/cognito.service');
const images = require('../services/image.service');

async function currentUser(req) {
  const user = await users.findById(req.user.id);
  if (!user) throw new HttpError(401, 'El usuario ya no existe');
  return user;
}

async function verifyPassword(email, password) {
  try {
    await cognito.authenticate(email, password);
  } catch (error) {
    if (error.status === 401) throw new HttpError(401, 'La contraseña es incorrecta');
    throw error;
  }
}

async function getMe(req, res) {
  const user = await currentUser(req);
  return res.json({ user: serialize.ownUser(user) });
}

async function updateMe(req, res) {
  const data = validation.profile(req.body);
  const user = await currentUser(req);
  await verifyPassword(user.email, data.password);
  if (await users.isDpiTakenByAnotherUser(data.dpi, user.id)) {
    throw new HttpError(409, 'El DPI ya está registrado');
  }

  const photoKey = data.photo ? await images.upload(images.PROFILE_FOLDER, data.photo) : user.photo_key;
  await cognito.updateProfile(user.email, data);
  const updated = await users.updateProfile(user.id, { fullName: data.fullName, dpi: data.dpi, photoKey });
  return res.json({ user: serialize.ownUser(updated) });
}

module.exports = { getMe, updateMe };
