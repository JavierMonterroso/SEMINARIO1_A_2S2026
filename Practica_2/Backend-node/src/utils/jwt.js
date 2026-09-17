const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(process.env.JWT_EXPIRES_IN_HOURS || '24') * 3600,
  });
}

function verifyToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  if (!Number.isInteger(payload.id) || payload.id < 1 || typeof payload.username !== 'string' || !payload.username || !Number.isInteger(payload.exp)) {
    throw new Error('Token invalido');
  }
  return payload;
}

module.exports = { signToken, verifyToken };
