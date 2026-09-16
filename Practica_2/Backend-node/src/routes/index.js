const express = require('express');
const authRoutes = require('./auth.routes');
const tasksRoutes = require('./tasks.routes');
const filesRoutes = require('./files.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', server: 'node' }));
router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/files', filesRoutes);

module.exports = router;
