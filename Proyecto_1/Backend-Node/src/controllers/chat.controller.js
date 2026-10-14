const validation = require('../utils/validation');
const HttpError = require('../utils/http-error');
const friendships = require('../repositories/friendships.repository');
const messages = require('../repositories/messages.repository');

async function friendIdFrom(req) {
  const friendId = validation.id(req.params.friendId, 'friendId');
  if (!(await friendships.areFriends(req.user.id, friendId))) {
    throw new HttpError(403, 'Solo puedes chatear con tus amigos');
  }
  return friendId;
}

async function listMessages(req, res) {
  const friendId = await friendIdFrom(req);
  return res.json({ messages: await messages.conversation(req.user.id, friendId) });
}

// El mensaje llega al amigo por WebSocket cuando el ChatGateway lo detecta en RDS.
async function sendMessage(req, res) {
  const friendId = await friendIdFrom(req);
  const content = validation.content(req.body, 2000);
  return res.status(201).json({ message: await messages.create(req.user.id, friendId, content) });
}

module.exports = { listMessages, sendMessage };
