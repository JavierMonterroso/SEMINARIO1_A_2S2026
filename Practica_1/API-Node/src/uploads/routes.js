const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { uploadToS3 } = require('./s3');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const FOLDERS = {
  perfil: 'Fotos_Perfil',
  pelicula: 'Fotos_Peliculas',
};

const router = express.Router();

// No es parte del contrato de la API Python (que recibe foto_perfil ya
// como string). Este endpoint es un extra para que el frontend suba el
// archivo real a S3 y obtenga la ruta relativa antes de llamar a
// /register, /login o /users/:id, tal como pide el enunciado sobre usar
// el SDK oficial de AWS para la subida de fotos.
router.post('/uploads/:tipo', upload.single('file'), async (req, res, next) => {
  try {
    const folder = FOLDERS[req.params.tipo];
    if (!folder) {
      return res.status(400).json({ detail: 'Tipo de imagen inválido (usar "perfil" o "pelicula")' });
    }
    if (!req.file) {
      return res.status(400).json({ detail: 'Debe enviar un archivo en el campo "file"' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const fileName = `${crypto.randomUUID()}${ext}`;
    const key = `${folder}/${fileName}`;

    await uploadToS3({ buffer: req.file.buffer, key, contentType: req.file.mimetype });

    res.status(201).json({ path: key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
