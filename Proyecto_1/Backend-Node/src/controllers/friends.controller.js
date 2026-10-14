const validation = require('../utils/validation');
const serialize = require('../utils/serialize');
const HttpError = require('../utils/http-error');
const users = require('../repositories/users.repository');
const friendships = require('../repositories/friendships.repository');

const UNIQUE_VIOLATION = '23505';

async function suggestions(req, res) {
  const rows = await friendships.suggestions(req.user.id);
  const result = rows.map((row) => ({
    ...serialize.publicUser(row),
    requestStatus: row.request_status,
    requestId: row.request_id,
  }));
  return res.json({ users: result });
}

async function listFriends(req, res) {
  const rows = await friendships.friends(req.user.id);
  return res.json({ friends: rows.map(serialize.publicUser) });
}

async function listRequests(req, res) {
  const rows = await friendships.pendingRequests(req.user.id);
  const requests = rows.map((row) => ({
    id: row.request_id,
    createdAt: row.created_at,
    sender: serialize.publicUser(row),
  }));
  return res.json({ requests });
}

async function sendRequest(req, res) {
  const receiverId = validation.friendRequest(req.body);
  if (receiverId === req.user.id || !(await users.findById(receiverId))) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  try {
    const id = await friendships.createRequest(req.user.id, receiverId);
    return res.status(201).json({ request: { id } });
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) throw new HttpError(409, 'Ya existe una solicitud o amistad con este usuario');
    throw error;
  }
}

async function acceptRequest(req, res) {
  const accepted = await friendships.accept(validation.id(req.params.id), req.user.id);
  if (!accepted) throw new HttpError(404, 'Solicitud no encontrada');
  return res.json({ message: 'Solicitud aceptada' });
}

async function rejectRequest(req, res) {
  const rejected = await friendships.reject(validation.id(req.params.id), req.user.id);
  if (!rejected) throw new HttpError(404, 'Solicitud no encontrada');
  return res.json({ message: 'Solicitud rechazada' });
}

module.exports = { suggestions, listFriends, listRequests, sendRequest, acceptRequest, rejectRequest };
