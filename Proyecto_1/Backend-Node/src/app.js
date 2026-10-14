require('express-async-errors');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const MAX_BODY = '8mb';
const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

const app = express();
app.set('case sensitive routing', true);

app.use(cors());
app.use((req, res, next) => {
  res.set('X-Backend', 'node');
  const contentType = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
  if (BODY_METHODS.includes(req.method) && contentType !== 'application/json') {
    return res.status(415).json({ error: 'Se requiere Content-Type application/json' });
  }
  return next();
});
app.use(express.json({ limit: MAX_BODY }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Un solo manejador de errores al final para no repetir try/catch en cada controlador.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'La solicitud supera el límite de 8 MB' });
  if (err.status) return res.status(err.status).json({ error: err.message, code: err.code });
  // No imprimir credenciales ni los datos completos de una solicitud.
  console.error('Error interno:', err.name, err.code || '', err.message);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
