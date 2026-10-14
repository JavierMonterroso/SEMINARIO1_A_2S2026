const express = require('express');
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');
const auth = require('../controllers/auth.controller');
const users = require('../controllers/users.controller');
const friends = require('../controllers/friends.controller');
const posts = require('../controllers/posts.controller');
const language = require('../controllers/language.controller');
const chat = require('../controllers/chat.controller');

const router = express.Router({ caseSensitive: true });

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', backend: 'node' });
  } catch {
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }
});

router.post('/auth/register', auth.register);
router.post('/auth/confirm', auth.confirm);
router.post('/auth/resend-code', auth.resendCode);
router.post('/auth/login', auth.login);
router.post('/auth/face-login', auth.faceLogin);

router.get('/users/me', requireAuth, users.getMe);
router.put('/users/me', requireAuth, users.updateMe);
router.get('/users/suggestions', requireAuth, friends.suggestions);

router.get('/friends', requireAuth, friends.listFriends);
router.get('/friend-requests', requireAuth, friends.listRequests);
router.post('/friend-requests', requireAuth, friends.sendRequest);
router.post('/friend-requests/:id/accept', requireAuth, friends.acceptRequest);
router.post('/friend-requests/:id/reject', requireAuth, friends.rejectRequest);

router.get('/posts', requireAuth, posts.listPosts);
router.post('/posts', requireAuth, posts.createPost);
router.post('/posts/:id/comments', requireAuth, posts.createComment);
router.get('/labels', requireAuth, posts.listLabels);

router.post('/translate', requireAuth, language.translate);
router.post('/speech', requireAuth, language.speech);
router.post('/chatbot', requireAuth, language.askChatbot);

router.get('/chat/:friendId/messages', requireAuth, chat.listMessages);
router.post('/chat/:friendId/messages', requireAuth, chat.sendMessage);

module.exports = router;
