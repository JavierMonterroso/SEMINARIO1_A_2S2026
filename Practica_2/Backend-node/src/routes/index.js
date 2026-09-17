const express = require('express');
const authRoutes = require('./auth.routes');
const tasksRoutes = require('./tasks.routes');
const filesRoutes = require('./files.routes');
const pool = require('../config/db');

const router = express.Router({ caseSensitive: true });

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok' });
  } catch {
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }
});
router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/files', filesRoutes);

module.exports = router;
