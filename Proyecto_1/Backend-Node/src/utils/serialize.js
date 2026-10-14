const { config } = require('../config/env');

function imageUrl(key) {
  return `${config.images.baseUrl}/${key}`;
}

function ownUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    dpi: row.dpi,
    photoUrl: imageUrl(row.photo_key),
  };
}

function publicUser(row) {
  return { id: row.id, fullName: row.full_name, photoUrl: imageUrl(row.photo_key) };
}

// Las consultas con JOIN traen al autor con el prefijo author_.
function author(row) {
  return { id: row.author_id, fullName: row.author_name, photoUrl: imageUrl(row.author_photo_key) };
}

function comment(row) {
  return { id: row.id, content: row.content, createdAt: row.created_at, author: author(row) };
}

function post(row, labels, comments) {
  return {
    id: row.id,
    description: row.description,
    imageUrl: imageUrl(row.image_key),
    createdAt: row.created_at,
    author: author(row),
    labels,
    comments,
  };
}

function message(row) {
  return {
    id: Number(row.id),
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

module.exports = { ownUser, publicUser, comment, post, message };
