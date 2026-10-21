# Semi-Social — Red social desplegada en AWS

**Curso:** Seminario de Sistemas 1  
**Universidad San Carlos de Guatemala | Facultad de Ingeniería | 2S2026**

| Integrante | Carné | Área |
| --- | --- | --- |
| Daved Abshalon Ejcalon Chonay | 202105668 | Identidad y flujo serverless: IAM, Cognito, Rekognition, Lambda y API Gateway |
| Hernán Ricardo Ávila Castillo | 9516085 | Datos y almacenamiento: RDS, S3, Translate, Polly y Lex |
| Javier Andrés Monterroso García | 202102140 | Cómputo y red: EC2, Security Groups y Load Balancer |

---

## Índice

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Tecnologías Utilizadas](#2-tecnologías-utilizadas)
3. [Arquitectura](#3-arquitectura)
4. [Usuarios IAM, Permisos y Roles](#4-usuarios-iam-permisos-y-roles)
5. [Servicios de AWS](#5-servicios-de-aws)
6. [Aplicación Web](#6-aplicación-web)
7. [Endpoints del API REST](#7-endpoints-del-api-rest)

---

## 1. Descripción del Proyecto

Hemos desarrollado **Semi-Social**, una aplicación web tipo red social desplegada completamente en Amazon Web Services. En ella, los usuarios pueden:

- **Registrarse** con nombre, correo, DPI, contraseña y foto de perfil (desde un archivo o la webcam), verificando su correo con **Cognito**.
- **Iniciar sesión** con usuario y contraseña, o por **reconocimiento facial** con **Rekognition**.
- **Publicar imágenes** con descripción; **Rekognition** genera sus etiquetas, que sirven para **filtrar** y **buscar** publicaciones.
- **Comentar** las publicaciones de sus amigos, **traducir** textos a 3 idiomas con **Translate** y **escucharlos** con **Polly**.
- **Agregar amigos** mediante solicitudes que se aceptan o rechazan, y **chatear** con ellos en tiempo real.
- Consultar a un **chatbot de Amazon Lex** sobre la Facultad de Ingeniería.

Hemos duplicado el backend en dos instancias EC2, una en **Node.js** y otra en **Python**, con exactamente los mismos endpoints y detrás de un **Application Load Balancer**. Si una instancia se detiene, la aplicación sigue funcionando con la otra.

---

## 2. Tecnologías Utilizadas

| Área | Tecnologías |
| --- | --- |
| **Frontend** | Desarrollamos la interfaz con **React 18** y **Vite**, y la publicamos como sitio estático en **Amazon S3**. |
| **Backend** | Implementamos el mismo API en **Node.js 22 con Express** y en **Python 3.12 con FastAPI**, ambos con WebSocket para el chat, desplegados en dos instancias **EC2** con **Ubuntu 24.04** detrás de un **Application Load Balancer**. |
| **Datos** | Guardamos la información en **PostgreSQL sobre Amazon RDS** y las imágenes en **Amazon S3**. |
| **Autenticación** | Usamos **Amazon Cognito** para el registro, el inicio de sesión y la verificación por correo, y **Amazon Rekognition** para el login facial. |
| **Serverless** | Recibimos las imágenes en **API Gateway**, protegido con API key, que dispara una **Lambda en Node.js**; otra **Lambda en Python** responde al bot. |
| **Inteligencia artificial** | Etiquetamos las imágenes con **Rekognition**, traducimos con **Translate** y **Comprehend**, leemos en voz alta con **Polly** y atendemos preguntas sobre la facultad con **Lex V2**. |
| **Seguridad** | Controlamos el acceso con **IAM** (usuarios, grupos y roles), **security groups** y **JWT**; los backends se comunican con AWS mediante el **SDK v3** y **boto3** usando credenciales temporales de rol. |

---

## 3. Arquitectura

> 📷 *Pendiente de implementar (Javier): diagrama y descripción de la arquitectura.*

---

## 4. Usuarios IAM, Permisos y Roles

Hemos usado la cuenta root únicamente para crear el usuario administrador del grupo; todo lo demás lo configuramos con usuarios IAM, uno por integrante. Asignamos los permisos **a grupos** y no directamente a los usuarios, para que la separación de responsabilidades quede explícita.

![Usuarios IAM](Docs/Imgs/00%20-%20Todos%20los%20usuarios%20IAM.png)

*Los tres usuarios IAM del proyecto, cada uno perteneciente a 2 grupos.*

### Grupos

| Grupo | Miembros | Políticas | Responsabilidad |
| --- | --- | --- | --- |
| `grp-base` | Daved, Hernan, Javier | `ReadOnlyAccess` | Lectura de toda la cuenta para revisar y explicar cualquier servicio |
| `grp-identidad` | Daved | `IAMFullAccess`, `AmazonCognitoPowerUser`, `AmazonRekognitionFullAccess`, `AWSLambda_FullAccess`, `AmazonAPIGatewayAdministrator` | Usuarios y roles IAM, autenticación y carga de imágenes |
| `grp-datos` | Hernan | `AmazonRDSFullAccess`, `TranslateFullAccess`, `AmazonPollyFullAccess`, `AmazonLexFullAccess`, `AWSLambda_FullAccess`, `s3-buckets-proyecto-hernan` | Base de datos, buckets, traducción, audio y chatbot |
| `grp-computo` | Javier | `AmazonEC2FullAccess`, `AmazonSSMFullAccess`, `pass-role-ec2-javier` | Instancias EC2, balanceador, security groups y Session Manager |

### Usuarios

#### Daved

![Permisos de Daved](Docs/Imgs/01%20-%20Permisos%20IAM%20Daved.png)

*`Daved` recibe sus permisos de `grp-base` y `grp-identidad`.*

#### Hernan

![Permisos de Hernan](Docs/Imgs/02%20-%20Permisos%20IAM%20Hernan.png)

*`Hernan` recibe sus permisos de `grp-base` y `grp-datos`, incluida la política insertada `s3-buckets-proyecto-hernan`.*

#### Javier

![Permisos de Javier](Docs/Imgs/03%20-%20Permisos%20IAM%20Javier.png)

*`Javier` recibe sus permisos de `grp-base` y `grp-computo`, incluida la política insertada `pass-role-ec2-javier`.*

### Políticas insertadas

| Política | Grupo | Permisos |
| --- | --- | --- |
| `s3-buckets-proyecto-hernan` | `grp-datos` | Listar buckets y administrar **solo** `semi1proyecto-g3-393698973824` y `proyecto-web-g3-393698973824`; cualquier otro bucket da *Access Denied* |
| `pass-role-ec2-javier` | `grp-computo` | `iam:PassRole` **solo** sobre `role-ec2-backend` y únicamente hacia EC2 |

### Roles

Los roles no los usan personas, sino los servicios de AWS, que obtienen credenciales temporales y las renuevan automáticamente.

| Rol | Lo usa | Confianza | Políticas |
| --- | --- | --- | --- |
| `role-ec2-backend` | Las 2 EC2 (perfil de instancia) | `ec2.amazonaws.com` | `backend-servicios-aws`, `AmazonSSMManagedInstanceCore` |
| `role-lambda-upload` | Lambda `upload-image` | `lambda.amazonaws.com` | `upload-imagenes-s3`, `AWSLambdaBasicExecutionRole` |
| `role-lambda-lex` | Lambda `lex-facultad` | `lambda.amazonaws.com` | `AWSLambdaBasicExecutionRole` |

En **`backend-servicios-aws`** hemos dividido los permisos en bloques, cada uno ligado a una funcionalidad de la aplicación:

| Bloque | Permisos | Funcionalidad |
| --- | --- | --- |
| `AnalisisDeImagenes` | `rekognition:DetectLabels`, `rekognition:CompareFaces` | Etiquetas y login facial |
| `LecturaDeImagenesParaRekognition` | `s3:GetObject` en `semi1proyecto-g3-393698973824/*` | Rekognition lee las imágenes desde S3 con los permisos del backend |
| `TraducirYEscuchar` | `translate:TranslateText`, `comprehend:DetectDominantLanguage`, `polly:SynthesizeSpeech` | Traducir y escuchar |
| `AdministrarUsuariosCognito` | `cognito-idp:AdminGetUser`, `AdminUpdateUserAttributes`, `AdminDeleteUser` (solo el User Pool del proyecto) | Login facial, edición de perfil y rollback del registro |
| `ConversarConLex` | `lex:RecognizeText` (solo el alias del bot) | Chatbot |

**`upload-imagenes-s3`** permite `s3:PutObject` **solo** en `Fotos_Perfil/*` y `Fotos_Publicadas/*` del bucket de imágenes: la Lambda puede escribir, pero no leer ni borrar.

---

## 5. Servicios de AWS

### 5.1 Amazon Cognito

| Configuración | Valor |
| --- | --- |
| User Pool | `User pool - lgacd8` (`us-east-1_bI8rvf8qL`) |
| Inicio de sesión | Correo electrónico |
| Atributos | `name`, `email` y el atributo personalizado `custom:dpi` (mutable, 13 caracteres) |
| Verificación | Código enviado automáticamente al correo |
| Cliente de aplicación | `semi-social-spa`, **sin secreto**, con `ALLOW_USER_PASSWORD_AUTH` |

![Cliente de aplicación de Cognito](Docs/Imgs/04%20-%20Config%20congnito.png)

*Cliente de aplicación `semi-social-spa` del User Pool.*

![Código de verificación de Cognito](Docs/Imgs/11%20-%20Codigo%20de%20verificacion%20Cognito.jpeg)

*Correo con el código de verificación que Cognito envía automáticamente al registrarse.*

**Relación con RDS:** al registrarse, creamos al usuario en Cognito y en RDS. La tabla `users` guarda el `cognito_sub` que devuelve Cognito y la contraseña cifrada con MD5. Al editar el perfil, validamos la contraseña contra Cognito y guardamos los cambios en ambos lugares. Si la subida de la foto o el guardado en RDS fallan durante el registro, eliminamos al usuario de Cognito para no dejar el correo ocupado.

### 5.2 Funciones Lambda

![Funciones Lambda](Docs/Imgs/05%20-%20Lambda.png)

*Las dos funciones del proyecto.*

#### `upload-image`

| Configuración | Valor |
| --- | --- |
| Runtime | Node.js |
| Rol | `role-lambda-upload` |
| Memoria / tiempo de espera | 256 MB / 15 s |
| Variable de entorno | `BUCKET_NAME=semi1proyecto-g3-393698973824` |
| Disparador | API Gateway `POST /images` |

La función recibe `{ folder, contentType, data }`, valida que la carpeta sea `Fotos_Perfil` o `Fotos_Publicadas`, que la imagen sea JPEG o PNG y que pese como máximo 4 MB, y la guarda en S3 con un nombre UUID. Devuelve la ruta (`key`) del archivo.

![Lambda upload-image](Docs/Imgs/08%20-%20Lambda%20upload-image.png)

*`upload-image` con API Gateway como disparador.*

#### `lex-facultad`

| Configuración | Valor |
| --- | --- |
| Runtime | Python 3.12 |
| Rol | `role-lambda-lex` |
| Controlador | `lambda_function.lambda_handler` |

Responde a los intents del bot: horarios, ubicación, carreras, asignación de cursos y contacto. Hemos hecho **dinámica** la respuesta de horarios: calcula con la hora de Guatemala si las oficinas están abiertas en ese momento.

![Lambda lex-facultad](Docs/Imgs/07%20-%20Lambda%20lex-facultad.png)

*`lex-facultad`, invocada por el bot de Lex.*

### 5.3 API Gateway

| Configuración | Valor |
| --- | --- |
| API | `semi-social-images` (REST, regional, ID `jl87dsuhf5`) |
| Recurso y método | `POST /images` con integración proxy hacia `upload-image` |
| Seguridad | **API key obligatoria** (`semi-social-backend`) y política TLS 1.2+ |
| Plan de uso | `semi-social-plan`: 10 solicitudes por segundo, ráfaga de 20 |
| Etapa | `prod`, en `https://jl87dsuhf5.execute-api.us-east-1.amazonaws.com/prod/images` |

![API semi-social-images](Docs/Imgs/09%20-%20Ventana%20API%20Gateway,%20semi-social-images.png)

*API REST `semi-social-images` disponible.*

![Ejecución del método POST /images](Docs/Imgs/06%20-%20Diagrama,%20%20ejecución%20de%20método.png)

*Flujo del método `POST /images`: la petición del cliente pasa por API Gateway y llega a la Lambda `upload-image` mediante integración proxy.*

Una petición sin API key recibe `403 Forbidden` sin llegar a la Lambda. El frontend nunca llama a API Gateway directamente: envía la imagen al backend, que la reenvía con la clave.

### 5.4 Amazon S3

Los nombres `semi1proyecto-g3` y `proyecto-web-g3` ya existían en otra cuenta de AWS (los nombres de bucket son globales), por lo que les agregamos el ID de nuestra cuenta como sufijo. Tampoco pudimos usar `Proyecto-Web-G3`, porque S3 no admite mayúsculas.

| Bucket | Contenido | Acceso |
| --- | --- | --- |
| `semi1proyecto-g3-393698973824` | `Fotos_Perfil/` y `Fotos_Publicadas/` | Lectura pública solo de las dos carpetas |
| `proyecto-web-g3-393698973824` | Build del frontend (`index.html`, `assets/`) | Hosting estático público |

![Buckets del proyecto](Docs/Imgs/13%20-%20S3%20buckets%20del%20proyecto.jpg)

*Los dos buckets del proyecto en la región us-east-1.*

![Carpetas del bucket de imágenes](Docs/Imgs/14%20-%20S3%20bucket%20de%20imagenes%20carpetas.jpg)

*Bucket de imágenes con las carpetas `Fotos_Perfil/` y `Fotos_Publicadas/`.*

![Política de lectura pública](Docs/Imgs/15%20-%20S3%20politica%20de%20lectura%20publica.jpg)

*Política del bucket de imágenes: lectura pública (`s3:GetObject`) solo de las dos carpetas.*

![Hosting estático](Docs/Imgs/16%20-%20S3%20hosting%20estatico.jpg)

*Alojamiento de sitio web estático habilitado en el bucket del frontend.*

### 5.5 Amazon RDS

| Configuración | Valor |
| --- | --- |
| Motor | PostgreSQL |
| Instancia | `semi-social-db` |
| Base de datos | `semisocial` |
| Acceso | Sin acceso público; solo desde `sg-ec2` por el puerto 5432 |

Hemos definido el esquema en [`Database/schema.sql`](Database/schema.sql): las tablas `users`, `friendships`, `posts`, `labels`, `post_labels`, `comments` y `messages`, y la vista `friends`, que lista las amistades aceptadas en ambas direcciones.

![Instancia de RDS](Docs/Imgs/17%20-%20RDS%20instancia%20disponible.jpg)

*Instancia `semi-social-db` disponible (PostgreSQL, `db.t3.micro`).*

![Resumen y conectividad de RDS](Docs/Imgs/18%20-%20RDS%20resumen%20y%20conectividad.jpg)

*Resumen y datos de conexión de la base de datos.*

### 5.6 Instancias EC2 y Security Groups

| Instancia | Backend | Perfil de instancia | Servicio |
| --- | --- | --- | --- |
| `semi-social-node` | Node.js (`Backend-Node/`) | `role-ec2-backend` | pm2 |
| `semi-social-python` | Python (`Backend-Python/`) | `role-ec2-backend` | systemd (`semi-social-python`) |

| Security group | Entrada permitida | Origen |
| --- | --- | --- |
| `sg-alb` | TCP 80 | `0.0.0.0/0` |
| `sg-ec2` | TCP 3000 | Solo `sg-alb` |
| `sg-rds` | TCP 5432 | Solo `sg-ec2` |

Administramos las instancias con **Session Manager**, sin abrir el puerto 22.

> 📷 *Capturas pendientes (Javier): instancias EC2 y security groups.*

### 5.7 Load Balancer

| Configuración | Valor |
| --- | --- |
| ALB | `semi-social-alb` (`semi-social-alb-1548506604.us-east-1.elb.amazonaws.com`) |
| Listener | HTTP 80, que reenvía al target group `tg-semi-social` |
| Target group | Las 2 EC2, puerto 3000, health check en `/api/health` |

`/api/health` responde `{"status":"ok","backend":"node"}` o `"python"`, lo que nos permite comprobar que el balanceador alterna entre las dos instancias. Al detener una, la aplicación sigue respondiendo con la otra.

> 📷 *Capturas pendientes (Javier): target group con los 2 destinos healthy y prueba de caída.*

### 5.8 Amazon Lex

| Configuración | Valor |
| --- | --- |
| Bot | ID `RIS1JHVVTY`, idioma Español (EE. UU.) `es_US` |
| Alias | `prod` (`UWNRGVX3QN`) con la Lambda `lex-facultad` como code hook |
| Intents | `HorarioFacultad`, `UbicacionFacultad`, `CarrerasFacultad`, `InscripcionFacultad`, `ContactoFacultad` |

![Detalle del bot de Lex](Docs/Imgs/19%20-%20Lex%20detalle%20del%20bot.jpg)

*Bot `FacultadIngenieriaBot` en español (EE. UU.).*

![Intenciones del bot](Docs/Imgs/20%20-%20Lex%20intenciones.jpg)

*Las cinco intenciones del bot más `FallbackIntent`.*

![Alias prod](Docs/Imgs/21%20-%20Lex%20alias%20prod.jpg)

*Alias `prod`, vinculado a la versión 1, con la Lambda `lex-facultad` como cumplimiento.*

### 5.9 Rekognition, Translate y Polly

Estos servicios no requieren configuración en la consola: los usamos desde los backends con los permisos de `role-ec2-backend`.

| Servicio | Uso |
| --- | --- |
| Rekognition `DetectLabels` | Hasta 10 etiquetas con confianza mínima de 80 % por publicación |
| Rekognition `CompareFaces` | Login facial con similitud mínima de 90 % contra la foto de perfil |
| Translate + Comprehend | Traducción a español, inglés, francés o portugués, con detección automática del idioma de origen |
| Polly `SynthesizeSpeech` | El backend devuelve una **URL prefirmada** (válida 5 minutos) que el navegador reproduce en `<audio>`; el audio no se guarda en S3 |

---

## 6. Aplicación Web

Sitio: `http://proyecto-web-g3-393698973824.s3-website-us-east-1.amazonaws.com`

![Feed y filtros por etiqueta](Docs/Imgs/10%20-%20Aplicacion%20feed%20y%20filtros.jpeg)

*Página principal: creación de publicaciones, buscador y filtros por las etiquetas que genera Rekognition, y una publicación con las opciones de traducir y escuchar.*

![Perfil y bot de la facultad](Docs/Imgs/12%20-%20Aplicacion%20perfil%20y%20bot.jpeg)

*Edición del perfil, que requiere la contraseña para guardar, junto al botón de acceso al bot de la facultad.*

> 📷 *Capturas pendientes: registro, login facial y chat.*

**Nota sobre la webcam:** los navegadores solo permiten la cámara en HTTPS o en `localhost`, y el hosting estático de S3 sirve por HTTP. En el sitio publicado se puede elegir una foto desde la computadora. Para usar la webcam, en Chrome habilitamos `chrome://flags/#unsafely-treat-insecure-origin-as-secure` con la URL del sitio.

---

## 7. Endpoints del API REST

Hemos implementado los mismos endpoints en ambos backends, con la misma respuesta. Estos son los principales:

| Método | Ruta | Auth | Descripción |
| --- | --- | :---: | --- |
| GET | `/api/health` | | Estado del backend; lo usa el health check del balanceador |
| POST | `/api/auth/register` | | Registro con foto (Cognito, S3 y RDS) |
| POST | `/api/auth/login` | | Login con usuario y contraseña |
| POST | `/api/auth/face-login` | | Login facial con Rekognition |
| PUT | `/api/users/me` | ✔ | Editar perfil (requiere la contraseña) |
| POST | `/api/friend-requests` | ✔ | Enviar solicitud de amistad |
| GET | `/api/posts?label=&search=` | ✔ | Feed propio y de amigos, con filtros por etiqueta |
| POST | `/api/posts` | ✔ | Crear publicación (etiquetas con Rekognition) |
| POST | `/api/translate` | ✔ | Traducir texto con Translate |
| POST | `/api/speech` | ✔ | URL prefirmada de Polly |
| POST | `/api/chatbot` | ✔ | Preguntar al bot de Lex |
| WS | `/ws?token=` | ✔ | Recepción de mensajes del chat en tiempo real |

Protegimos los endpoints con un **JWT** que se envía en el encabezado `Authorization: Bearer <token>`.
