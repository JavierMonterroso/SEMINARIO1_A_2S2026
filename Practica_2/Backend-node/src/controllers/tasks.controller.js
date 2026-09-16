const pool = require('../config/db');

async function listTasks(req, res) {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  return res.json({ tasks: result.rows });
}

async function createTask(req, res) {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El titulo es obligatorio' });
  }

  const result = await pool.query(
    `INSERT INTO tasks (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.user.id, title, description || null]
  );
  return res.status(201).json({ task: result.rows[0] });
}

async function updateTask(req, res) {
  const { title, description } = req.body;
  const result = await pool.query(
    `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description)
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [title, description, req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.json({ task: result.rows[0] });
}

async function completeTask(req, res) {
  const { completed } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [Boolean(completed), req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.json({ task: result.rows[0] });
}

async function deleteTask(req, res) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.status(204).send();
}

module.exports = { listTasks, createTask, updateTask, completeTask, deleteTask };
