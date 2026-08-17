require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // RDS exige SSL; a diferencia de psycopg (Python), el driver `pg`
    // no lo negocia automáticamente y hay que pedirlo explícitamente.
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-2',
    imagesBucket: process.env.S3_IMAGES_BUCKET,
  },
};
