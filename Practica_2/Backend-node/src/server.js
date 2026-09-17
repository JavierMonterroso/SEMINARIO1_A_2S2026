const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const missing = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Completa estas variables en Backend-node/.env: ${missing.join(', ')}`);
  process.exit(1);
}
const hours = Number(process.env.JWT_EXPIRES_IN_HOURS || '24');
if (!Number.isInteger(hours) || hours < 1 || hours > 8760) {
  console.error('JWT_EXPIRES_IN_HOURS debe ser un entero entre 1 y 8760');
  process.exit(1);
}
const app = require('./app');
const pool = require('./config/db');

const port = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor Node.js escuchando en el puerto ${port}`);
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => server.close(async () => { await pool.end(); process.exit(0); }));
    }
  } catch (error) {
    console.error('No se pudo conectar a RDS. Revisa las variables DB_ y el acceso de red.', error.code || error.name);
    await pool.end();
    process.exit(1);
  }
}

start();
