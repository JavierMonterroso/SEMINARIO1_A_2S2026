const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { listFiles, registerFile, getFile } = require('../controllers/files.controller');

const router = express.Router();
router.use(requireAuth);

router.get('/', listFiles);
router.post('/', registerFile);
router.get('/:id', getFile);

module.exports = router;
