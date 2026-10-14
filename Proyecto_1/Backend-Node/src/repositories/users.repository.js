const { pool } = require('../config/db');

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function isEmailOrDpiTaken(email, dpi) {
  const { rows } = await pool.query('SELECT 1 FROM users WHERE email = $1 OR dpi = $2 LIMIT 1', [email, dpi]);
  return rows.length > 0;
}

async function isDpiTakenByAnotherUser(dpi, userId) {
  const { rows } = await pool.query('SELECT 1 FROM users WHERE dpi = $1 AND id <> $2', [dpi, userId]);
  return rows.length > 0;
}

async function create(user) {
  const { rows } = await pool.query(
    `INSERT INTO users (cognito_sub, full_name, email, dpi, password_hash, photo_key)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user.cognitoSub, user.fullName, user.email, user.dpi, user.passwordHash, user.photoKey]
  );
  return rows[0];
}

async function updateProfile(id, profile) {
  const { rows } = await pool.query(
    `UPDATE users SET full_name = $2, dpi = $3, photo_key = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, profile.fullName, profile.dpi, profile.photoKey]
  );
  return rows[0];
}

module.exports = { findById, findByEmail, isEmailOrDpiTaken, isDpiTakenByAnotherUser, create, updateProfile };
