const { pool, transaction } = require('../config/db');
const serialize = require('../utils/serialize');

const FEED_LIMIT = 100;

const POST_COLUMNS = `p.id, p.description, p.image_key, p.created_at,
  u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key`;

// Un usuario ve sus publicaciones y las de sus amigos.
function visibleTo(viewerParam) {
  return `(p.user_id = ${viewerParam} OR p.user_id IN (SELECT friend_id FROM friends WHERE user_id = ${viewerParam}))`;
}

function hasLabel(condition) {
  return `EXISTS (SELECT 1 FROM post_labels pl JOIN labels l ON l.id = pl.label_id
    WHERE pl.post_id = p.id AND ${condition})`;
}

async function feed(viewerId, filter) {
  const { rows } = await pool.query(
    `SELECT ${POST_COLUMNS}
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE ${visibleTo('$1')}
       AND ($2::text IS NULL OR ${hasLabel('l.name = $2')})
       AND ($3::text IS NULL OR ${hasLabel(`l.name ILIKE '%' || $3 || '%'`)})
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT ${FEED_LIMIT}`,
    [viewerId, filter.label, filter.search]
  );
  return withDetails(rows);
}

async function findById(postId) {
  const { rows } = await pool.query(
    `SELECT ${POST_COLUMNS} FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
    [postId]
  );
  const [post] = await withDetails(rows);
  return post;
}

async function withDetails(postRows) {
  if (!postRows.length) return [];
  const postIds = postRows.map((row) => row.id);
  const [labels, comments] = await Promise.all([labelsByPost(postIds), commentsByPost(postIds)]);
  return postRows.map((row) => serialize.post(row, labels.get(row.id) || [], comments.get(row.id) || []));
}

async function labelsByPost(postIds) {
  const { rows } = await pool.query(
    `SELECT pl.post_id, l.name
     FROM post_labels pl JOIN labels l ON l.id = pl.label_id
     WHERE pl.post_id = ANY($1)
     ORDER BY l.name`,
    [postIds]
  );
  return groupByPost(rows, (row) => row.name);
}

async function commentsByPost(postIds) {
  const { rows } = await pool.query(
    `SELECT c.id, c.post_id, c.content, c.created_at,
            u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.post_id = ANY($1)
     ORDER BY c.created_at, c.id`,
    [postIds]
  );
  return groupByPost(rows, serialize.comment);
}

function groupByPost(rows, toItem) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.post_id)) groups.set(row.post_id, []);
    groups.get(row.post_id).push(toItem(row));
  }
  return groups;
}

async function visibleLabels(viewerId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT l.name
     FROM labels l
     JOIN post_labels pl ON pl.label_id = l.id
     JOIN posts p ON p.id = pl.post_id
     WHERE ${visibleTo('$1')}
     ORDER BY l.name`,
    [viewerId]
  );
  return rows.map((row) => row.name);
}

async function create(post) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      'INSERT INTO posts (user_id, description, image_key) VALUES ($1, $2, $3) RETURNING id',
      [post.userId, post.description, post.imageKey]
    );
    const postId = rows[0].id;
    await client.query(
      `WITH saved_labels AS (
         INSERT INTO labels (name) SELECT unnest($2::text[])
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id
       )
       INSERT INTO post_labels (post_id, label_id) SELECT $1, id FROM saved_labels`,
      [postId, post.labels]
    );
    return postId;
  });
}

// Solo inserta si la publicacion es del usuario o de uno de sus amigos.
async function createComment(postId, userId, content) {
  const { rows } = await pool.query(
    `WITH inserted AS (
       INSERT INTO comments (post_id, user_id, content)
       SELECT p.id, $2, $3 FROM posts p WHERE p.id = $1 AND ${visibleTo('$2')}
       RETURNING *
     )
     SELECT i.id, i.content, i.created_at,
            u.id AS author_id, u.full_name AS author_name, u.photo_key AS author_photo_key
     FROM inserted i JOIN users u ON u.id = i.user_id`,
    [postId, userId, content]
  );
  return rows[0] ? serialize.comment(rows[0]) : null;
}

module.exports = { feed, findById, visibleLabels, create, createComment };
