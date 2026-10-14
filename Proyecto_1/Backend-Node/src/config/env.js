const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const REQUIRED_VARIABLES = [
  'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'AWS_REGION',
  'COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID',
  'IMAGE_UPLOAD_URL', 'IMAGE_UPLOAD_API_KEY', 'IMAGES_BUCKET', 'IMAGES_BASE_URL',
  'LEX_BOT_ID', 'LEX_BOT_ALIAS_ID',
];

function missingVariables() {
  return REQUIRED_VARIABLES.filter((name) => !process.env[name]?.trim());
}

// Toda la configuracion vive aqui para que el resto del codigo no lea process.env.
const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresInHours: Number(process.env.JWT_EXPIRES_IN_HOURS) || 8,
  },
  aws: { region: process.env.AWS_REGION },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
  },
  images: {
    uploadUrl: process.env.IMAGE_UPLOAD_URL,
    uploadApiKey: process.env.IMAGE_UPLOAD_API_KEY,
    bucket: process.env.IMAGES_BUCKET,
    baseUrl: (process.env.IMAGES_BASE_URL || '').replace(/\/+$/, ''),
  },
  lex: {
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID || 'es_US',
  },
};

module.exports = { config, missingVariables };
