const crypto = require('crypto');

function hashPasswordMd5(password) {
  return crypto.createHash('md5').update(password, 'utf8').digest('hex');
}

module.exports = { hashPasswordMd5 };
