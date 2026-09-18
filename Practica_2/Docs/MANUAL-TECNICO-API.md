# TaskFlow + CloudDrive — Manual técnico de API y backends

Este documento cubre el contrato de la API, la configuración de los backends y las
pruebas. El manual técnico exigido por el enunciado (datos de estudiantes,
arquitectura, IAM, capturas y conclusión) está en [`../README.md`](../README.md).

## Configuración de los backends

Node.js y Python tienen las mismas rutas, cuerpos JSON y respuestas. Ambos acceden al mismo RDS y utilizan el mismo `JWT_SECRET`. Los `.env` están excluidos de Git; al instalar por primera vez copia `.env.example` a `.env` y completa `DB_PASSWORD` y `JWT_SECRET`.

Host: `taskflow-db.clagayom87id.us-east-2.rds.amazonaws.com`, puerto `5432`, base `taskflow_db`, usuario `taskflowadmin`. Ambos backends escuchan en `0.0.0.0:3000`.

Los backends solo acceden a PostgreSQL: no necesitan `AWS_S3_BUCKET`, variables de almacenamiento, credenciales AWS ni permisos IAM para escribir en S3. Las variables antiguas de almacenamiento que queden en un `.env` existente ya no se utilizan.

Las contraseñas de usuarios se guardan con bcrypt, costo 10, y no se devuelven en las respuestas. Admiten entre 1 y 72 bytes UTF-8. El JWT dura 24 horas por defecto (`JWT_EXPIRES_IN_HOURS`) y es compatible entre ambos lenguajes.

## Contrato de las APIs

Las peticiones usan `Content-Type: application/json`. Las rutas protegidas requieren `Authorization: Bearer <token>`. Las fechas se devuelven en UTC con milisegundos. Los errores de los backends usan `{"error":"mensaje"}`.

| Método | Endpoint | Cuerpo | Respuesta exitosa |
| --- | --- | --- | --- |
| GET | `/api/health` | — | 200 `{"status":"ok"}` |
| POST | `/api/auth/register` | Usuario, correo, contraseña, confirmación y URL de imagen | 201 `{"user":{...}}` |
| POST | `/api/auth/login` | `{"username":"ana","password":"..."}` | 200 `{"token":"...","user":{...}}` |
| GET | `/api/tasks` | — | 200 `{"tasks":[...]}` |
| POST | `/api/tasks` | `{"title":"Estudiar","description":"Tema 1"}` | 201 `{"task":{...}}` |
| PUT | `/api/tasks/:id` | Título y/o descripción | 200 `{"task":{...}}` |
| PATCH | `/api/tasks/:id/complete` | `{"completed":true}` o `false` | 200 `{"task":{...}}` |
| DELETE | `/api/tasks/:id` | — | 204 sin cuerpo |
| GET | `/api/files` | — | 200 `{"files":[...]}` |
| POST | `/api/files` | `{"name":"nota.txt","type":"text/plain","url":"https://..."}` | 201 `{"file":{...}}` |
| GET | `/api/files/:id` | — | 200 `{"file":{...}}` |

Registro:

```json
{
  "username": "ana",
  "email": "ana@example.com",
  "password": "mi contraseña",
  "confirmPassword": "mi contraseña",
  "profileImageUrl": "https://practica2semi1a1s2026archivosg3-usac.s3.us-east-2.amazonaws.com/images/perfil.png"
}
```

El frontend primero sube la imagen mediante API Gateway/Lambda y después envía `profileImageUrl`. Ambos backends validan la URL HTTP/HTTPS y guardan su valor en `users.profile_image_url`; no cargan bytes a S3. El contrato anterior con un objeto `profileImage` en base64 ya no se admite. Actualiza ambos backends antes de publicar el frontend nuevo.

Las tareas tienen `id`, `user_id`, `title`, `description`, `completed` y `created_at`. La fecha se genera en PostgreSQL; al editar, omitir la descripción la conserva y enviar `null` la borra. Los archivos tienen `id`, `user_id`, `name`, `type`, `url` y `created_at`. Sus tipos admitidos actualmente son `image/...` y `text/plain` con nombre terminado en `.txt`. Los usuarios solo pueden consultar y modificar sus propios datos.

`/api/health` comprueba acceso a la base de datos y sirve como health check del ALB. La cabecera `X-Backend` identifica `node` o `python` sin cambiar el JSON.

## Frontend y funciones de carga

El frontend es HTML/CSS/JavaScript estático; no requiere compilación. Publica el contenido de `Frontend/` en el bucket `practica2semi1a1s2026paginawebg3-usac`, dejando `index.html`, `register.html`, `tasks.html`, `files.html`, `css/` y `js/` directamente en la raíz. No subas `.env`, los backends ni la carpeta `Frontend` como un nivel adicional.

`Frontend/js/config.js` ya contiene las URLs de AWS:

- `API_BASE_URL`: `http://taskflow-alb-444566755.us-east-2.elb.amazonaws.com/api`.
- `UPLOAD_IMAGE_URL`: `https://w4hwh1fpik.execute-api.us-east-2.amazonaws.com/upload-image`.
- `UPLOAD_TEXT_URL`: `https://w4hwh1fpik.execute-api.us-east-2.amazonaws.com/upload-text`.

La versión actual permite exclusivamente imágenes y archivos `.txt` no vacíos, de hasta 5 MB. Otros formatos se rechazan antes de invocar Lambda. Esta limitación fue solicitada mientras se consulta al auxiliar sobre el requisito general de cargar cualquier tipo de archivo; no se creó una tercera función ni se agregó soporte de otros tipos.

Las imágenes, incluidas las de perfil, se envían a `/upload-image` como:

```json
{"filename":"foto.png","contentType":"image/png","image":"<base64>"}
```

Los `.txt` se leen como texto UTF-8 y se envían a `/upload-text` como:

```json
{"filename":"nota.txt","content":"Contenido del archivo"}
```

Las Lambda Python desplegadas usan `BUCKET_NAME=practica2semi1a1s2026archivosg3-usac`. Devuelven `message`, `url` y `key`; el frontend utiliza `url` y muestra `message` cuando la carga falla. En la sección de archivos, después de la carga se envía `POST /api/files` con `name`, `type` y `url`. Si Lambda falla, no se crea el registro de usuario ni los metadatos del archivo.

La interfaz previsualiza imágenes y TXT. Según el contexto recibido, CORS de API Gateway y del bucket de archivos ya está configurado; el bucket permite lectura `GET` y `HEAD` desde cualquier origen.

Las funciones JavaScript existentes en `Serverless/` son referencias de otra implementación con un contrato distinto (`fileName`, `contentType`, `data`). No reemplaces las Lambda Python desplegadas con esas referencias durante esta actualización. La integración actual apunta a AWS; Azure se configurará por separado.

El ALB actual usa HTTP. Publica esta versión mediante el endpoint HTTP del sitio web de S3; servir la web por HTTPS mientras la API principal sigue en HTTP produce bloqueo de contenido mixto en el navegador.

## Actualizar las EC2 existentes

Después de confirmar y subir los cambios al repositorio, ejecuta en la EC2 Node.js:

```bash
cd ~/SEMINARIO1_A_2S2026
git pull --ff-only origin main
cd Practica_2/Backend-node
npm ci
pm2 restart taskflow-node --update-env
pm2 save
curl -i http://localhost:3000/api/health
```

En la EC2 Python:

```bash
cd ~/SEMINARIO1_A_2S2026
git pull --ff-only origin main
cd Practica_2/Backend-python
venv/bin/python -m pip install -r requirements.txt
sudo systemctl restart taskflow-python
```

Espera unos segundos y ejecuta `curl -i http://localhost:3000/api/health`. Los `.env` existentes y las tablas de RDS se conservan. No vuelvas a cargar el SQL ni ejecutes otra vez los scripts de instalación para aplicar estos cambios. Cuando ambos health checks respondan correctamente, publica el frontend y actualiza el navegador para cargar los scripts nuevos.

## Instalación inicial

En `Practica_2`, con los `.env` completos, ejecuta `bash Deploy/setup-node.sh` en la EC2 Node.js y `bash Deploy/setup-python.sh` en la EC2 Python. El primero configura PM2 e inicio automático; el segundo adapta usuario y rutas y configura systemd. No copies directamente la plantilla `.service` a systemd.

Las tablas ya se cargaron en RDS. Para una base nueva, aplica `Database/schema.sql` una vez desde una EC2 con acceso a RDS:

```bash
psql "host=taskflow-db.clagayom87id.us-east-2.rds.amazonaws.com port=5432 dbname=taskflow_db user=taskflowadmin sslmode=require" -W --single-transaction -v ON_ERROR_STOP=1 -f Database/schema.sql
```

## TLS hacia RDS

Se conserva la configuración mínima solicitada: Node.js usa `ssl: { rejectUnauthorized: false }` y Python usa `sslmode="require"`. No hay variables SSL adicionales ni instalación manual de certificados. La conexión está cifrada; esta configuración no garantiza la verificación de identidad del servidor.

## Verificación

`Tests/test_contract.py` compara ambos backends con PostgreSQL temporal local y TLS, sin conectarse a RDS. Comprueba registro por URL, bcrypt/JWT entre lenguajes, JSON y errores, CRUD, aislamiento, concurrencia, fechas y cifrado. Si Google Chrome está instalado, recorre además la interfaz con los contratos exactos de las Lambda simulados: registro con foto, login, tareas, cargas, vistas previas, rechazo de otros tipos, errores y logout. `TEST_BROWSER=0` omite el navegador.

Instala las dependencias de los backends y `pip install -r Tests/requirements.txt`, inicia PostgreSQL de pruebas local con TLS y ejecuta desde `Backend-python`:

```bash
TEST_PG_PORT=55432 venv/bin/python ../Tests/test_contract.py
node ../Tests/test_uploads.js
```

La prueba crea una base propia y la elimina al terminar. `Tests/test_uploads.js` comprueba las referencias JavaScript AWS/Azure con SDK simulados; no prueba las Lambda Python desplegadas.

Según el contexto recibido, ALB, EC2, RDS, buckets, Lambda, API Gateway y CORS están configurados. Después de actualizar ambos backends y publicar el frontend, realiza el mismo recorrido con los servicios reales. No se modificó infraestructura AWS durante esta adaptación.
