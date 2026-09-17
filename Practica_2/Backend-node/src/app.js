require('express-async-errors');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.set('case sensitive routing', true);

app.use(cors());
app.use((req, res, next) => {
  res.set('X-Backend', 'node');
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ error: 'Se requiere Content-Type application/json' });
  }
  next();
});
app.use(express.json({ limit: '8mb' }));
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || Array.isArray(req.body) || typeof req.body !== 'object')) {
    return res.status(400).json({ error: 'JSON invalido' });
  }
  next();
});
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Deje un manejador de errores al final para no repetir try/catch en cada controlador.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON invalido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'La solicitud supera el limite de 8 MB' });
  if (err.code === '23505') return res.status(409).json({ error: 'El nombre de usuario ya existe' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  // No imprimir credenciales ni los datos completos de una solicitud.
  console.error('Error interno:', err.code || err.name);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
