const { Pool } = require('pg');
const { config } = require('./env');

// Centralice la conexion a RDS en un solo pool para reutilizarlo en toda la API.
const pool = new Pool({
  ...config.db,
  connectionTimeoutMillis: 10000,
  // TLS sin validacion del certificado, equivalente a sslmode=require en Python.
  ssl: { rejectUnauthorized: false },
});

async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, transaction };
