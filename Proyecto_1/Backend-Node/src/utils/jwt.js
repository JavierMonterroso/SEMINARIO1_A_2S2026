const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwt.secret,
    { algorithm: 'HS256', expiresIn: `${config.jwt.expiresInHours}h` }
  );
}

function verifyToken(token) {
  const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  if (!Number.isInteger(payload.id) || typeof payload.email !== 'string') {
    throw new jwt.JsonWebTokenError('Token invalido');
  }
  return payload;
}

module.exports = { signToken, verifyToken };
