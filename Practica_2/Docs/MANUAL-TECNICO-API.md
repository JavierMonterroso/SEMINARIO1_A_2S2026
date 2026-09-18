# TaskFlow + CloudDrive — Manual técnico de API y backends

Este documento cubre el contrato de la API, la configuración de los backends y las
pruebas. El manual técnico exigido por el enunciado (datos de estudiantes,
arquitectura, IAM, capturas y conclusión) está en [`../README.md`](../README.md).

Aplicación de tareas y archivos con dos APIs equivalentes: Node.js/Express y Python/FastAPI. La primera vista después del login es **Tareas**, con acceso a Archivos desde la navegación.

## Integrantes

| Nombre | Carnet |
| --- | --- |
| Hernán Ricardo Ávila Castillo | 9516085 |
| Javier Andrés Monterroso García | 202102140 |
| Daved Abshalon Ejcalon Chonay | 202105668 |

Datos tomados del manual existente de la Práctica 1.

## Configuración pendiente

Los archivos `Backend-node/.env` y `Backend-python/.env` se prepararon localmente y están excluidos de Git. Si clonas el repositorio en una EC2, copia el `.env.example` correspondiente a `.env`.

Completa en ambos servidores:

| Variable | Qué colocar |
| --- | --- |
| `DB_PASSWORD` | La contraseña real de `taskflowadmin`. |
| `JWT_SECRET` | La misma clave aleatoria larga en ambos backends; al menos 32 bytes. Se configura una vez, no por usuario. |
| `AWS_S3_BUCKET` | El nombre del bucket de archivos cuando lo crees. Es necesario para el registro con imagen. |

Host, puerto, base de datos, usuario, región y puerto de la aplicación ya están configurados según el contexto compartido. No se incluyeron claves de AWS; las EC2 necesitan permisos de escritura al bucket mediante su rol IAM. Para Azure, selecciona `STORAGE_PROVIDER=azure` y completa `AZURE_STORAGE_CONNECTION_STRING` y `AZURE_STORAGE_CONTAINER`.

Puedes generar un secreto con `openssl rand -hex 32` y pegar **el mismo resultado** en ambos `.env`. No lo publiques ni lo incluyas en capturas.

## Ejecución en las EC2

La conectividad a RDS fue validada con `psql` desde ambas EC2. La base de datos es privada: ejecutar desde tu computadora requiere conectividad adicional que no está configurada aquí.

### Tablas

Desde una de las EC2, en la carpeta `Practica_2`, aplica el esquema una sola vez:

```bash
psql "host=taskflow-db.clagayom87id.us-east-2.rds.amazonaws.com port=5432 dbname=taskflow_db user=taskflowadmin sslmode=require" -W -f Database/schema.sql
```

Se solicita la contraseña de forma interactiva. Las tablas usan `CREATE TABLE IF NOT EXISTS`, por lo que puedes repetir el comando sin borrar datos.

### Node.js

Usa Node.js 22 o posterior. Dentro de `Backend-node`:

```bash
cp .env.example .env   # Solo si todavía no existe; luego completa los valores pendientes.
npm ci
npm start
```

Para instalar y configurar el proceso con PM2 en Ubuntu, después de completar el `.env`, puedes ejecutar `bash Deploy/setup-node.sh` desde `Practica_2`.

### Python

Usa Python 3.10 o posterior. Las dependencias se actualizaron para admitir versiones recientes de Python. Dentro de `Backend-python`:

```bash
cp .env.example .env   # Solo si todavía no existe; luego completa los valores pendientes.
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
venv/bin/python -m app
```

Para instalar y configurar el servicio de systemd en Ubuntu, después de completar el `.env`, ejecuta `bash Deploy/setup-python.sh` desde `Practica_2`. El script adapta usuario y rutas a la instalación real; no copies directamente la plantilla `.service` a systemd.

Ambos backends escuchan en `0.0.0.0:3000`. Cada uno debe ejecutarse en su propia EC2.

```bash
curl http://localhost:3000/api/health
```

Respuesta: `{"status":"ok"}`. Esta ruta comprueba acceso a la base de datos y sirve para el health check del balanceador. La cabecera `X-Backend` identifica `node` o `python` sin cambiar el JSON.

## Contrato de las APIs

Todos los cuerpos de petición usan `Content-Type: application/json`. Los endpoints protegidos requieren `Authorization: Bearer <token>`. Las fechas se devuelven en UTC con milisegundos (`2026-09-17T12:00:00.000Z`). Las listas muestran primero los registros más recientes. Los errores usan siempre `{"error":"mensaje"}`.

| Método | Endpoint | Cuerpo | Respuesta exitosa |
| --- | --- | --- | --- |
| GET | `/api/health` | — | 200 `{"status":"ok"}` |
| POST | `/api/auth/register` | Usuario, correo, contraseña, confirmación e imagen | 201 `{"user":{...}}` |
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
  "profileImage": {
    "fileName": "perfil.png",
    "contentType": "image/png",
    "data": "<contenido del archivo en base64>"
  }
}
```

La imagen de perfil es requerida. Se sube desde el backend al almacenamiento configurado; la base de datos conserva su URL. No se admiten formularios multipart en este contrato; el frontend ya convierte las imágenes a JSON/base64.

Las contraseñas se almacenan con bcrypt, costo 10, y no aparecen en las respuestas. Deben ocupar entre 1 y 72 bytes UTF-8, por compatibilidad con bcrypt. El token dura 24 horas por defecto, según `JWT_EXPIRES_IN_HOURS`, y funciona en cualquiera de los dos backends.

Las tareas tienen `id`, `user_id`, `title`, `description`, `completed` y `created_at`. La fecha se genera automáticamente en PostgreSQL. La descripción puede ser vacía o `null`; al editar, omitirla conserva su valor y enviar `null` lo borra. El título es obligatorio, admite hasta 150 caracteres y no puede quedar vacío. Los usuarios solo pueden consultar y modificar sus propios datos.

Los archivos tienen `id`, `user_id`, `name`, `type`, `url` y `created_at`. Sus bytes se cargan mediante serverless; los backends registran y consultan sus metadatos.

## Frontend y funciones de carga

El frontend es HTML/CSS/JavaScript estático; no requiere compilación. Publica el contenido de `Frontend` en S3 o en el sitio estático de Azure Storage.

Completa `Frontend/js/config.js` para cada nube:

- `API_BASE_URL`: URL del balanceador, terminada en `/api`.
- `UPLOAD_IMAGE_URL`: ruta pública de carga de imágenes.
- `UPLOAD_TEXT_URL`: ruta pública de carga de documentos y otros archivos.

La interfaz incluye registro con foto, login, creación/edición/completado/eliminación de tareas y fecha de creación. Archivos muestra nombre y tipo, previsualiza imágenes y texto, y permite abrir otros formatos con el navegador o la aplicación correspondiente. Los datos de los usuarios se muestran como texto, sin interpretar HTML.

Ambas funciones de carga reciben:

```json
{"fileName":"nota.txt","contentType":"text/plain","data":"<base64>"}
```

Respuesta: `{"url":"https://..."}`. Se admiten archivos no vacíos de hasta **5 MB**. La ruta de documentos acepta también otros tipos binarios. El límite de la API JSON de los backends es 8 MB para admitir la expansión de base64.

AWS: ejecuta `npm install` en `Serverless/aws-lambda`, incluye `node_modules`, `index.js` y `validation.js` en el paquete y crea dos funciones con handlers `index.uploadImage` e `index.uploadText`. Configura `AWS_S3_BUCKET` (bucket de archivos), la región y los permisos IAM de escritura. Publica las rutas POST y configura CORS/OPTIONS en API Gateway.

Azure: ejecuta `npm install` en `Serverless/azure-functions` y publica el contenido como Function App. Configura `AZURE_STORAGE_CONNECTION_STRING` y `AZURE_STORAGE_CONTAINER` en los ajustes de la aplicación. Publica las rutas mediante API Management. Las funciones requieren clave (`authLevel=function`); API Management debe agregar la clave al llamar al backend. Configura CORS/OPTIONS y el acceso desde el frontend; este no envía claves de función ni de suscripción.

Configura lectura pública de objetos mediante la política del bucket S3 y permisos de lectura de Blob. Los uploads no usan ACL de objetos, de acuerdo con los buckets S3 actuales que deshabilitan ACL por defecto. Configura CORS de lectura GET en el almacenamiento para la previsualización de texto. Usa URLs y esquema HTTP/HTTPS compatibles entre frontend y APIs.

## TLS hacia RDS

Se aplica únicamente la configuración mínima solicitada: Node.js usa `ssl: { rejectUnauthorized: false }` y Python usa `sslmode="require"`. No hay variables SSL adicionales ni instalación manual de certificados. La conexión está cifrada; esta configuración no garantiza la verificación de identidad del servidor.

## Verificación

`Tests/test_contract.py` compara los dos backends usando PostgreSQL temporal local con TLS y almacenamiento simulado. Comprueba registro/login, bcrypt y JWT entre lenguajes, JSON y errores, CRUD, aislamiento por usuario, concurrencia, fechas y cifrado de las conexiones. No se conecta a RDS ni modifica recursos cloud.

Para repetirla, instala las dependencias de Node y Python y `pip install -r Tests/requirements.txt`, inicia un PostgreSQL de pruebas **local** con TLS y ejecuta:

```bash
TEST_PG_PORT=55432 venv/bin/python ../Tests/test_contract.py
node ../Tests/test_uploads.js
```

La prueba crea una base temporal propia y la elimina al terminar. `Tests/test_uploads.js` comprueba funciones AWS/Azure con los SDK simulados. Si Google Chrome está instalado, la prueba de interfaz también recorre registro, login, tareas, archivos y logout. Puedes omitirla con `TEST_BROWSER=0`.

## Recursos todavía pendientes en la infraestructura compartida

El balanceador, su grupo de seguridad, el acceso al puerto 3000, los buckets, Lambda/API Gateway y los servicios Azure aún no estaban configurados según el contexto recibido. Este trabajo deja el código preparado; las pruebas locales no demuestran que el despliegue cloud esté terminado. Antes de evaluar, comprueba ambos backends con RDS/S3 reales y que el balanceador mantenga la aplicación al detener cualquiera de las instancias.

Fuentes técnicas: [pg](https://node-postgres.com/features/ssl), [Psycopg y concurrencia](https://www.psycopg.org/docs/pool.html), [SSL de PostgreSQL](https://www.postgresql.org/docs/current/libpq-ssl.html), [S3 Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html).
