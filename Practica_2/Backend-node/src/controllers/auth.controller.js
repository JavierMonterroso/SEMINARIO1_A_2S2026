const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const validation = require('../utils/validation');
const { row } = require('../utils/serialize');

async function register(req, res) {
  const { username, email, password, profileImageUrl } = validation.register(req.body);

  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'El nombre de usuario ya existe' });
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, profile_image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, profile_image_url, created_at`,
    [username, email, passwordHash, profileImageUrl]
  );

  return res.status(201).json({ user: row(result.rows[0]) });
}

async function login(req, res) {
  const { username, password } = validation.login(req.body);

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = signToken({ id: user.id, username: user.username });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      profile_image_url: user.profile_image_url,
    },
  });
}

module.exports = { register, login };
