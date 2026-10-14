const http = require('http');
const { config, missingVariables } = require('./config/env');

const missing = missingVariables();
if (missing.length) {
  console.error(`Completa estas variables en Backend-Node/.env: ${missing.join(', ')}`);
  process.exit(1);
}

const app = require('./app');
const { pool } = require('./config/db');
const { verifyToken } = require('./utils/jwt');
const messages = require('./repositories/messages.repository');
const ChatGateway = require('./realtime/chat-gateway');

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('No se pudo conectar a RDS. Revisa las variables DB_ y el acceso de red.', error.code || error.name);
    await pool.end();
    process.exit(1);
  }

  const server = http.createServer(app);
  const chatGateway = new ChatGateway({ server, verifyToken, messages });
  await chatGateway.start();
  server.listen(config.port, '0.0.0.0', () => {
    console.log(`Servidor Node.js escuchando en el puerto ${config.port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      chatGateway.stop();
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }
}

start();
