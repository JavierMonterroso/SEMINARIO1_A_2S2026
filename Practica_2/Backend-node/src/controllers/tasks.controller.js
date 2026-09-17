const pool = require('../config/db');
const validation = require('../utils/validation');
const { row } = require('../utils/serialize');

async function listTasks(req, res) {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC, id DESC',
    [req.user.id]
  );
  return res.json({ tasks: result.rows.map(row) });
}

async function createTask(req, res) {
  const { title, description } = validation.task(req.body);

  const result = await pool.query(
    `INSERT INTO tasks (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.user.id, title, description]
  );
  return res.status(201).json({ task: row(result.rows[0]) });
}

async function updateTask(req, res) {
  const id = validation.id(req.params.id);
  const body = validation.task(req.body, true);
  const result = await pool.query(
    `UPDATE tasks SET title = COALESCE($1, title),
     description = CASE WHEN $3 THEN $2 ELSE description END
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [body.title ?? null, body.description ?? null, Object.hasOwn(body, 'description'), id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.json({ task: row(result.rows[0]) });
}

async function completeTask(req, res) {
  const id = validation.id(req.params.id);
  const completed = validation.complete(req.body);
  const result = await pool.query(
    'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [completed, id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.json({ task: row(result.rows[0]) });
}

async function deleteTask(req, res) {
  const id = validation.id(req.params.id);
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.status(204).send();
}

module.exports = { listTasks, createTask, updateTask, completeTask, deleteTask };
