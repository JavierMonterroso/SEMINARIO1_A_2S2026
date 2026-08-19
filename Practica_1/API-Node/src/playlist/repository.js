const { pool } = require('../database');

async function getPlaylistItem(idUsuario, idPelicula) {
  const { rows } = await pool.query(
    'SELECT * FROM lista_reproduccion WHERE id_usuario = $1 AND id_pelicula = $2',
    [idUsuario, idPelicula]
  );
  return rows[0] || null;
}

async function addMovieToPlaylist(idUsuario, idPelicula) {
  const { rows } = await pool.query(
    `INSERT INTO lista_reproduccion (id_usuario, id_pelicula)
     VALUES ($1, $2)
     RETURNING id_lista, id_usuario, id_pelicula, fecha_agregado`,
    [idUsuario, idPelicula]
  );
  return rows[0];
}

async function getUserPlaylist(idUsuario) {
  const { rows } = await pool.query(
    `SELECT lr.id_lista, lr.id_usuario, p.id_pelicula, p.titulo, p.director, p.anio_estreno, p.url_contenido, p.poster, p.estado, lr.fecha_agregado
     FROM lista_reproduccion lr
     JOIN pelicula p ON p.id_pelicula = lr.id_pelicula
     WHERE lr.id_usuario = $1
     ORDER BY lr.fecha_agregado DESC`,
    [idUsuario]
  );
  return rows;
}

async function deleteMovieFromPlaylist(idUsuario, idPelicula) {
  const { rows } = await pool.query(
    'DELETE FROM lista_reproduccion WHERE id_usuario = $1 AND id_pelicula = $2 RETURNING id_lista',
    [idUsuario, idPelicula]
  );
  return rows[0] || null;
}

module.exports = {
  getPlaylistItem,
  addMovieToPlaylist,
  getUserPlaylist,
  deleteMovieFromPlaylist,
};
