const express = require('express');
const { getAllMovies, getMovieById } = require('./repository');
const { isNumericId } = require('../utils/validators');

const router = express.Router();

router.param('idPelicula', (req, res, next, value) => {
  if (!isNumericId(value) || Number(value) < 1) {
    return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
  }
  next();
});

router.get('/movies', async (req, res, next) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

router.get('/movies/:idPelicula', async (req, res, next) => {
  try {
    const movie = await getMovieById(req.params.idPelicula);
    if (!movie) {
      return res.status(404).json({ detail: 'Pelicula no encontrada' });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
