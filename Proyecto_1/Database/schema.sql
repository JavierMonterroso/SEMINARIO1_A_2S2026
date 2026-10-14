-- Semi-Social - esquema de PostgreSQL para Amazon RDS.
-- Ejecutar una sola vez sobre la base de datos vacia.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  cognito_sub   VARCHAR(64)  NOT NULL UNIQUE,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  dpi           CHAR(13)     NOT NULL UNIQUE,
  -- La rubrica exige guardar la contrasena cifrada con MD5; Cognito es quien autentica.
  password_hash CHAR(32)     NOT NULL,
  photo_key     VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Una fila por pareja de usuarios: PENDING es una solicitud, ACCEPTED una amistad.
-- Una solicitud rechazada se elimina para que pueda volver a enviarse.
CREATE TABLE friendships (
  id           SERIAL PRIMARY KEY,
  requester_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  addressee_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status       VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CHECK (requester_id <> addressee_id)
);

-- Impide dos filas para la misma pareja sin importar quien envio la solicitud.
CREATE UNIQUE INDEX friendships_pair_idx
  ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- Lista de amigos en ambas direcciones para no repetir la logica en cada consulta.
CREATE VIEW friends AS
  SELECT requester_id AS user_id, addressee_id AS friend_id FROM friendships WHERE status = 'ACCEPTED'
  UNION ALL
  SELECT addressee_id AS user_id, requester_id AS friend_id FROM friendships WHERE status = 'ACCEPTED';

CREATE TABLE posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  description TEXT,
  image_key   VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_user_created_idx ON posts (user_id, created_at DESC);

-- Etiquetas que devuelve Rekognition DetectLabels.
CREATE TABLE labels (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE post_labels (
  post_id  INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels (id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, label_id)
);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER     NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_post_idx ON comments (post_id, created_at);

-- El id creciente permite que cada instancia EC2 detecte los mensajes nuevos.
CREATE TABLE messages (
  id          BIGSERIAL PRIMARY KEY,
  sender_id   INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  receiver_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_conversation_idx ON messages (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), id);
