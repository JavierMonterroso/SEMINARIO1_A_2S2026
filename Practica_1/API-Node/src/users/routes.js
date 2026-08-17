const express = require('express');
const { hashPasswordMd5 } = require('./security');
const {
  toUserResponse,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserProfile,
} = require('./repository');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { correo, nombre_completo, contrasena, foto_perfil } = req.body;

    const existing = await getUserByEmail(correo);
    if (existing) {
      return res.status(409).json({ detail: 'El correo ya está registrado' });
    }

    const hashed = hashPasswordMd5(contrasena);
    const newUser = await createUser({
      correo,
      nombreCompleto: nombre_completo,
      contrasena: hashed,
      fotoPerfil: foto_perfil,
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    const user = await getUserByEmail(correo);

    if (!user) {
      return res.status(401).json({ detail: 'Correo o contraseña incorrectos' });
    }

    const hashed = hashPasswordMd5(contrasena);
    if (user.contrasena.trim() !== hashed) {
      return res.status(401).json({ detail: 'Correo o contraseña incorrectos' });
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:idUsuario', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.idUsuario);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:idUsuario', async (req, res, next) => {
  try {
    const { nombre_completo, foto_perfil } = req.body;

    if (nombre_completo === undefined && foto_perfil === undefined) {
      return res.status(400).json({ detail: 'Debe enviar al menos un campo para actualizar' });
    }

    const updated = await updateUserProfile(req.params.idUsuario, {
      nombreCompleto: nombre_completo,
      fotoPerfil: foto_perfil,
    });

    if (!updated) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
