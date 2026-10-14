const crypto = require('crypto');

// La rubrica pide MD5. La autenticacion real la hace Cognito, no esta funcion.
function md5(plain) {
  return crypto.createHash('md5').update(plain, 'utf8').digest('hex');
}

module.exports = { md5 };
