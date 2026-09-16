const pool = require('../config/db');

async function listFiles(req, res) {
  const result = await pool.query(
    'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  return res.json({ files: result.rows });
}

async function registerFile(req, res) {
  const { name, type, url } = req.body;
  if (!name || !type || !url) {
    return res.status(400).json({ error: 'name, type y url son obligatorios' });
  }

  const result = await pool.query(
    `INSERT INTO files (user_id, name, type, url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.user.id, name, type, url]
  );
  return res.status(201).json({ file: result.rows[0] });
}

async function getFile(req, res) {
  const result = await pool.query(
    'SELECT * FROM files WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }
  return res.json({ file: result.rows[0] });
}

module.exports = { listFiles, registerFile, getFile };
