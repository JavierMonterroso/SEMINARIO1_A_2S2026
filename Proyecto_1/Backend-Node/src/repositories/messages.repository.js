const { pool } = require('../config/db');
const serialize = require('../utils/serialize');

const CONVERSATION_LIMIT = 200;
const POLL_BATCH_LIMIT = 500;

async function conversation(userId, friendId) {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT * FROM messages
       WHERE LEAST(sender_id, receiver_id) = LEAST($1::int, $2::int)
         AND GREATEST(sender_id, receiver_id) = GREATEST($1::int, $2::int)
       ORDER BY id DESC
       LIMIT ${CONVERSATION_LIMIT}
     ) recent
     ORDER BY id`,
    [userId, friendId]
  );
  return rows.map(serialize.message);
}

async function create(senderId, receiverId, content) {
  const { rows } = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
    [senderId, receiverId, content]
  );
  return serialize.message(rows[0]);
}

async function latestId() {
  const { rows } = await pool.query('SELECT COALESCE(MAX(id), 0) AS id FROM messages');
  return Number(rows[0].id);
}

async function newerThan(lastId) {
  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE id > $1 ORDER BY id LIMIT ${POLL_BATCH_LIMIT}`,
    [lastId]
  );
  return rows.map(serialize.message);
}

module.exports = { conversation, create, latestId, newerThan };
