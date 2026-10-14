const validation = require('../utils/validation');
const HttpError = require('../utils/http-error');
const posts = require('../repositories/posts.repository');
const images = require('../services/image.service');
const rekognition = require('../services/rekognition.service');

async function listPosts(req, res) {
  const filter = validation.postFilter(req.query);
  return res.json({ posts: await posts.feed(req.user.id, filter) });
}

async function listLabels(req, res) {
  return res.json({ labels: await posts.visibleLabels(req.user.id) });
}

async function createPost(req, res) {
  const data = validation.post(req.body);
  const imageKey = await images.upload(images.POSTS_FOLDER, data.image);
  const labels = await rekognition.detectLabels(imageKey);
  const postId = await posts.create({ userId: req.user.id, description: data.description, imageKey, labels });
  return res.status(201).json({ post: await posts.findById(postId) });
}

async function createComment(req, res) {
  const postId = validation.id(req.params.id);
  const content = validation.content(req.body, 1000);
  const comment = await posts.createComment(postId, req.user.id, content);
  if (!comment) throw new HttpError(404, 'Publicación no encontrada');
  return res.status(201).json({ comment });
}

module.exports = { listPosts, listLabels, createPost, createComment };
