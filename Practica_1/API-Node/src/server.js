const express = require('express');
const cors = require('cors');
const config = require('./config');
const { pool } = require('./database');

const userRoutes = require('./users/routes');
const movieRoutes = require('./movies/routes');
const playlistRoutes = require('./playlist/routes');
const uploadRoutes = require('./uploads/routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CloudCinema API', documentation: '/check' });
});

app.get('/check', (req, res) => {
  res.json({ status: 'OK', backend: 'Node.js Express' });
});

app.get('/db-check', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'PostgreSQL', server_time: rows[0].now });
  } catch (err) {
    next(err);
  }
});

app.use(userRoutes);
app.use(movieRoutes);
app.use(playlistRoutes);
app.use(uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`CloudCinema Node API escuchando en el puerto ${config.port}`);
});
