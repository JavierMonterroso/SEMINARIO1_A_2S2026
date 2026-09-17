const pool = require('../config/db');
const validation = require('../utils/validation');
const { row } = require('../utils/serialize');

async function listFiles(req, res) {
  const result = await pool.query(
    'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC, id DESC',
    [req.user.id]
  );
  return res.json({ files: result.rows.map(row) });
}

async function registerFile(req, res) {
  const { name, type, url } = validation.file(req.body);

  const result = await pool.query(
    `INSERT INTO files (user_id, name, type, url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.user.id, name, type, url]
  );
  return res.status(201).json({ file: row(result.rows[0]) });
}

async function getFile(req, res) {
  const id = validation.id(req.params.id);
  const result = await pool.query(
    'SELECT * FROM files WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }
  return res.json({ file: row(result.rows[0]) });
}

module.exports = { listFiles, registerFile, getFile };
