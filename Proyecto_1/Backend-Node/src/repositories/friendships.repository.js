const { pool } = require('../config/db');

const SAME_PAIR = `LEAST(f.requester_id, f.addressee_id) = LEAST(u.id, $1)
  AND GREATEST(f.requester_id, f.addressee_id) = GREATEST(u.id, $1)`;

// Usuarios que no son amigos, con el estado de la solicitud pendiente si existe.
async function suggestions(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.photo_key, f.id AS request_id,
            CASE WHEN f.id IS NULL THEN 'NONE'
                 WHEN f.requester_id = $1 THEN 'SENT'
                 ELSE 'RECEIVED' END AS request_status
     FROM users u
     LEFT JOIN friendships f ON ${SAME_PAIR}
     WHERE u.id <> $1 AND (f.id IS NULL OR f.status = 'PENDING')
     ORDER BY u.full_name`,
    [userId]
  );
  return rows;
}

async function friends(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.photo_key
     FROM friends fr
     JOIN users u ON u.id = fr.friend_id
     WHERE fr.user_id = $1
     ORDER BY u.full_name`,
    [userId]
  );
  return rows;
}

async function pendingRequests(userId) {
  const { rows } = await pool.query(
    `SELECT f.id AS request_id, f.created_at, u.id, u.full_name, u.photo_key
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.addressee_id = $1 AND f.status = 'PENDING'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

async function createRequest(requesterId, addresseeId) {
  const { rows } = await pool.query(
    'INSERT INTO friendships (requester_id, addressee_id) VALUES ($1, $2) RETURNING id',
    [requesterId, addresseeId]
  );
  return rows[0].id;
}

async function accept(requestId, addresseeId) {
  const { rowCount } = await pool.query(
    `UPDATE friendships SET status = 'ACCEPTED', responded_at = NOW()
     WHERE id = $1 AND addressee_id = $2 AND status = 'PENDING'`,
    [requestId, addresseeId]
  );
  return rowCount > 0;
}

async function reject(requestId, addresseeId) {
  const { rowCount } = await pool.query(
    `DELETE FROM friendships WHERE id = $1 AND addressee_id = $2 AND status = 'PENDING'`,
    [requestId, addresseeId]
  );
  return rowCount > 0;
}

async function areFriends(userId, otherUserId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2',
    [userId, otherUserId]
  );
  return rows.length > 0;
}

module.exports = { suggestions, friends, pendingRequests, createRequest, accept, reject, areFriends };
