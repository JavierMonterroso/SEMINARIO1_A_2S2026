const { pool } = require('../database');

async function getAllMovies() {
  const { rows } = await pool.query('SELECT * FROM pelicula ORDER BY id_pelicula');
  return rows;
}

async function getMovieById(idPelicula) {
  const { rows } = await pool.query('SELECT * FROM pelicula WHERE id_pelicula = $1', [idPelicula]);
  return rows[0] || null;
}

module.exports = { getAllMovies, getMovieById };
