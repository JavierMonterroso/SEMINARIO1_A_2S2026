// Servidor de prueba: PostgreSQL real y almacenamiento simulado, sin tocar AWS.
const path = require('path');
const { createRequire } = require('module');
const backendRequire = createRequire(path.resolve(__dirname, '../Backend-node/src/app.js'));
const storage = backendRequire('./config/storage');
storage.uploadBuffer = async () => 'https://storage.example/profile.png';
const app = backendRequire('./app');
const pool = backendRequire('./config/db');
const express = backendRequire('express');
const outer = express();
const uploaded = new Map();
outer.get('/js/config.js', (req, res) => res.type('application/javascript').send(
  `const CONFIG={API_BASE_URL:'/api',UPLOAD_IMAGE_URL:'/mock-upload',UPLOAD_TEXT_URL:'/mock-upload'};`
));
outer.post('/mock-upload', express.json({ limit: '8mb' }), (req, res) => {
  const id = uploaded.size + 1;
  uploaded.set(id, req.body);
  res.json({ url: `http://127.0.0.1:${server.address().port}/mock-file/${id}` });
});
outer.get('/mock-file/:id', (req, res) => {
  const file = uploaded.get(Number(req.params.id));
  if (!file) return res.sendStatus(404);
  res.type(file.contentType).send(Buffer.from(file.data, 'base64'));
});
outer.get('/browser-test.html', (req, res) => res.sendFile(path.join(__dirname, 'browser_fixture.html')));
outer.use((req, res, next) => req.path.startsWith('/api') ? app(req, res, next) : next());
outer.use(express.static(path.join(__dirname, '../Frontend')));
const server = outer.listen(0, '127.0.0.1', () => console.log(JSON.stringify({ port: server.address().port })));
process.on('SIGTERM', () => server.close(async () => { await pool.end(); process.exit(0); }));
