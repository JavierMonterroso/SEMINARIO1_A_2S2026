const express = require('express');
const { getUserById } = require('../users/repository');
const { getMovieById } = require('../movies/repository');
const { isNumericId } = require('../utils/validators');
const {
  getPlaylistItem,
  addMovieToPlaylist,
  getUserPlaylist,
  deleteMovieFromPlaylist,
} = require('./repository');

const router = express.Router();

router.param('idUsuario', (req, res, next, value) => {
  if (!isNumericId(value) || Number(value) < 1) {
    return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
  }
  next();
});

router.param('idPelicula', (req, res, next, value) => {
  if (!isNumericId(value) || Number(value) < 1) {
    return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
  }
  next();
});

router.post('/users/:idUsuario/playlist', async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const { id_pelicula } = req.body || {};

    if (!Number.isInteger(id_pelicula) || id_pelicula < 1) {
      return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
    }

    const user = await getUserById(idUsuario);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    const movie = await getMovieById(id_pelicula);
    if (!movie) {
      return res.status(404).json({ detail: 'Película no encontrada' });
    }

    const existing = await getPlaylistItem(idUsuario, id_pelicula);
    if (existing) {
      return res.status(409).json({ detail: 'La película ya está en la lista de reproducción' });
    }

    const item = await addMovieToPlaylist(idUsuario, id_pelicula);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.get('/users/:idUsuario/playlist', async (req, res, next) => {
  try {
    const { idUsuario } = req.params;

    const user = await getUserById(idUsuario);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    const playlist = await getUserPlaylist(idUsuario);
    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:idUsuario/playlist/:idPelicula', async (req, res, next) => {
  try {
    const { idUsuario, idPelicula } = req.params;

    const user = await getUserById(idUsuario);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    const movie = await getMovieById(idPelicula);
    if (!movie) {
      return res.status(404).json({ detail: 'Película no encontrada' });
    }

    const deleted = await deleteMovieFromPlaylist(idUsuario, idPelicula);
    if (!deleted) {
      return res.status(404).json({ detail: 'La película no está en la lista de reproducción' });
    }

    res.json({ message: 'Película eliminada de la lista de reproducción' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
