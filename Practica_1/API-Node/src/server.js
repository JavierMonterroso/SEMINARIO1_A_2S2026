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
    const { rows } = await pool.query(
      `SELECT TO_CHAR(
         CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
         'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
       ) AS server_time`
    );
    res.json({ status: 'OK', database: 'PostgreSQL', server_time: rows[0].server_time });
  } catch (err) {
    next(err);
  }
});

app.use(userRoutes);
app.use(movieRoutes);
app.use(playlistRoutes);
app.use(uploadRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ detail: 'El archivo no debe superar los 5 MB' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ detail: 'Datos de solicitud inválidos' });
  }

  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`CloudCinema Node API escuchando en el puerto ${config.port}`);
});
