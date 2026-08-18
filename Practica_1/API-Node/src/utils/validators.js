const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNumericId(value) {
  return /^\d+$/.test(value);
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value);
}

module.exports = { isNumericId, isValidEmail };
