const express = require('express');
const { getAllMovies, getMovieById } = require('./repository');

const router = express.Router();

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
