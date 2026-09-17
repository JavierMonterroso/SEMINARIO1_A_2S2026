const { Pool } = require('pg');

// Centralice la conexion a RDS en un solo pool para reutilizarlo en toda la API.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 10000,
  // TLS sin validacion del certificado, equivalente a sslmode=require en Python.
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
