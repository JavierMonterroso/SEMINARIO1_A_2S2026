const express = require('express');
const multer = require('multer');
const { register, login } = require('../controllers/auth.controller');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);

module.exports = router;
