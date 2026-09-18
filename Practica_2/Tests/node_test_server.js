// Servidor de prueba: PostgreSQL real y contratos Lambda simulados, sin tocar AWS.
const path = require('path');
const { createRequire } = require('module');
const backendRequire = createRequire(path.resolve(__dirname, '../Backend-node/src/app.js'));
const app = backendRequire('./app');
const pool = backendRequire('./config/db');
const express = backendRequire('express');
const outer = express();
const uploaded = new Map();
outer.get('/js/config.js', (req, res) => res.type('application/javascript').send(
  `const CONFIG={API_BASE_URL:'/api',UPLOAD_IMAGE_URL:'/mock-upload-image',UPLOAD_TEXT_URL:'/mock-upload-text'};`
));
function saveUpload(file, res) {
  const id = uploaded.size + 1;
  uploaded.set(id, file);
  res.json({ url: `http://127.0.0.1:${server.address().port}/mock-file/${id}` });
}
outer.post('/mock-upload-image', express.json({ limit: '8mb' }), (req, res) => {
  const { filename, contentType, image } = req.body;
  if (Object.keys(req.body).sort().join(',') !== 'contentType,filename,image' || !filename || !contentType?.startsWith('image/') || !image) {
    return res.status(400).json({ message: 'Contrato de imagen invalido' });
  }
  if (filename === 'fallo.png') return res.status(400).json({ message: 'La imagen fue rechazada' });
  saveUpload({ contentType, buffer: Buffer.from(image, 'base64') }, res);
});
outer.post('/mock-upload-text', express.json({ limit: '8mb' }), (req, res) => {
  const { filename, content } = req.body;
  if (Object.keys(req.body).sort().join(',') !== 'content,filename' || !filename?.toLowerCase().endsWith('.txt') || typeof content !== 'string' || !content) {
    return res.status(400).json({ message: 'Contrato de texto invalido' });
  }
  saveUpload({ contentType: 'text/plain; charset=utf-8', buffer: Buffer.from(content, 'utf8') }, res);
});
outer.get('/mock-file/:id', (req, res) => {
  const file = uploaded.get(Number(req.params.id));
  if (!file) return res.sendStatus(404);
  res.type(file.contentType).send(file.buffer);
});
outer.get('/browser-test.html', (req, res) => res.sendFile(path.join(__dirname, 'browser_fixture.html')));
outer.use((req, res, next) => req.path.startsWith('/api') ? app(req, res, next) : next());
outer.use(express.static(path.join(__dirname, '../Frontend')));
const server = outer.listen(0, '127.0.0.1', () => console.log(JSON.stringify({ port: server.address().port })));
process.on('SIGTERM', () => server.close(async () => { await pool.end(); process.exit(0); }));
