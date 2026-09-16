const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  listTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} = require('../controllers/tasks.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

module.exports = router;
