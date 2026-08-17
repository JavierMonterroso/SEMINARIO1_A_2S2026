const { pool } = require('../database');

function toUserResponse(row) {
  return {
    id_usuario: row.id_usuario,
    correo: row.correo,
    nombre_completo: row.nombre_completo,
    foto_perfil: row.foto_perfil,
  };
}

async function getUserByEmail(correo) {
  const { rows } = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
  return rows[0] || null;
}

async function getUserById(idUsuario) {
  const { rows } = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [idUsuario]);
  return rows[0] || null;
}

async function createUser({ correo, nombreCompleto, contrasena, fotoPerfil }) {
  const { rows } = await pool.query(
    `INSERT INTO usuario (correo, nombre_completo, contrasena, foto_perfil)
     VALUES ($1, $2, $3, $4)
     RETURNING id_usuario, correo, nombre_completo, foto_perfil`,
    [correo, nombreCompleto, contrasena, fotoPerfil]
  );
  return rows[0];
}

async function updateUserProfile(idUsuario, { nombreCompleto, fotoPerfil }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (nombreCompleto !== undefined) {
    fields.push(`nombre_completo = $${idx++}`);
    values.push(nombreCompleto);
  }
  if (fotoPerfil !== undefined) {
    fields.push(`foto_perfil = $${idx++}`);
    values.push(fotoPerfil);
  }

  values.push(idUsuario);

  const { rows } = await pool.query(
    `UPDATE usuario SET ${fields.join(', ')}
     WHERE id_usuario = $${idx}
     RETURNING id_usuario, correo, nombre_completo, foto_perfil`,
    values
  );
  return rows[0] || null;
}

module.exports = {
  toUserResponse,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserProfile,
};
