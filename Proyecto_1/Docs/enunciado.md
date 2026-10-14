# Semi-Social

Seminario de Sistemas 1

Universidad San Carlos de Guatemala\
Facultad de ingeniería.\
Ingeniería en ciencias y sistemas

**PONDERACIÓN:** 30 pts\
**Tiempo estimado:** 30 hrs

## Índice

- [1. Marco Formativo](#1-marco-formativo)
  - [1.1. Valor](#11-valor)
  - [1.2. Competencia(s)](#12-competencias)
  - [1.3. Objetivo SMART](#13-objetivo-smart)
- [2. Resumen Ejecutivo](#2-resumen-ejecutivo)
- [3. Enunciado del Proyecto](#3-enunciado-del-proyecto)
  - [3.1 Servicios a utilizar](#31-servicios-a-utilizar)
    - [3.1.1 Sitio web](#311-sitio-web)
    - [3.1.2 Infraestructura EC2 y Balanceador](#312-infraestructura-ec2-y-balanceador)
    - [3.1.3 Amazon RDS](#313-amazon-rds)
    - [3.1.4 Imágenes en S3](#314-imágenes-en-s3)
    - [3.1.5 API Gateway y Función Lambda (Carga de Imágenes)](#315-api-gateway-y-función-lambda-carga-de-imágenes)
    - [3.1.6 Amazon Lex (Bot)](#316-amazon-lex-bot)
    - [3.1.7 Cognito](#317-cognito)
    - [3.1.8 Rekognition](#318-rekognition)
    - [3.1.9 Translate](#319-translate)
    - [3.1.10 Configuración Polly (Reproducción de Texto)](#3110-configuración-polly-reproducción-de-texto)
    - [3.1.11 Seguridad](#3111-seguridad)
    - [3.1.12 Página Web](#3112-página-web)
    - [3.1.13 Manual Técnico](#3113-manual-técnico)
  - [3.2 Consideraciones](#32-consideraciones)
  - [3.3 Entregables](#33-entregables)
- [4. Valores](#4-valores)
- [5. Material de apoyo](#5-material-de-apoyo)
- [6. Metodología](#6-metodología)
- [7. Recursos y herramientas a utilizar](#7-recursos-y-herramientas-a-utilizar)
- [8. Desarrollo de Habilidades Blandas](#8-desarrollo-de-habilidades-blandas)
- [9. Cronograma](#9-cronograma)
- [10. Rúbrica de Calificación](#10-rúbrica-de-calificación)
  - [10.1 Requisitos para optar a la calificación](#101-requisitos-para-optar-a-la-calificación)
  - [10.2 Resumen de Puntuaciones](#102-resumen-de-puntuaciones)
  - [10.3 Comentarios Generales](#103-comentarios-generales)
  - [10.4 Detalle de la Calificación](#104-detalle-de-la-calificación)

## 1. Marco Formativo

### 1.1. Valor

**Perseverancia.** El estudiante fortalecerá este valor al trabajar en
ejercicios desafiantes, fomentando múltiples intentos y analizando errores sin
desmotivarse.

### 1.2. Competencia(s)

**Competencia general**: Aplica principios básicos de ingeniería, ciencias de
computación y sistemas de información y comunicación en la formulación y
resolución adecuada de problemas complejos.

**Competencias específicas**:

- Diseña, implementa y despliega una arquitectura web distribuida y escalable en
  la nube, integrando servicios de cómputo balanceados (EC2 y ELB), bases de
  datos relacionales seguras (RDS) y almacenamiento de objetos estáticos y
  multimedia (S3).
- Integra servicios cloud avanzados (Amazon Cognito, Rekognition, Translate, Lex
  y Polly) para dotar a las aplicaciones web de funcionalidades complejas, como
  autenticación biométrica, traducción dinámica de contenido, asistencia
  conversacional (chatbots) y síntesis de texto a voz.
- Implementa flujos de trabajo basados en eventos (Serverless) con API Gateway y
  AWS Lambda para procesar recursos multimedia de forma eficiente, aplicando con
  rigor políticas de seguridad, roles y control de acceso (IAM) para proteger la
  infraestructura del sistema.

### 1.3. Objetivo SMART

| Dimensión | Definición | Descripción |
| --- | --- | --- |
| Específico (¿Qué?) | El objetivo es concreto y tangible. | Desarrollar una aplicación web tipo red social desplegada completamente en la nube utilizando Amazon Web Services (AWS), que permita a los usuarios registrarse, iniciar sesión, publicar imágenes, comentar, comunicarse mediante chat y traducir contenido, integrando servicios como Cognito, Rekognition, S3, Lambda, API Gateway, RDS, EC2, ELB, Lex, Polly y Translate. |
| Medible (¿Cuánto?) | El objetivo tiene una medida objetiva de éxito. | Implementar correctamente al menos 10 servicios de AWS requeridos en la práctica y demostrar su funcionamiento mediante evidencias en el repositorio (capturas, endpoints funcionales, arquitectura desplegada y aplicación operativa accesible públicamente). |
| Alcanzable (¿Cómo?) | El objetivo debe ser posible con los recursos disponibles. | Construir la solución mediante el uso de herramientas accesibles para los estudiantes como AWS Free Tier, Node.js o Python, GitHub y frameworks web, aplicando la documentación oficial de AWS y los materiales proporcionados en el curso. |
| Realista (¿Para qué?) | El objetivo contribuye a metas más amplias. | Aplicar conceptos de arquitectura cloud, microservicios, balanceo de carga, almacenamiento distribuido, autenticación gestionada y servicios de inteligencia artificial, permitiendo al estudiante comprender cómo se diseñan y despliegan aplicaciones modernas escalables en la nube. |
| A Tiempo (¿Cuándo?) | El objetivo tiene fecha límite o mejor aún un cronograma de hitos de progreso. | Diseñar, implementar y desplegar la aplicación en AWS dentro del periodo comprendido entre 22 de septiembre de 2026 y 22 de octubre de 2026, entregando el repositorio documentado y el sistema funcional para su evaluación el 24 de octubre de 2026. |

## 2. Resumen Ejecutivo

Este proyecto se desarrolla en el marco del curso Seminario de Sistemas 1 y se
enfoca en el despliegue de arquitecturas en la nube mediante Amazon Web Services
(AWS). El problema a resolver es la necesidad corporativa de lanzar una
plataforma interactiva moderna y segura que expanda los servicios digitales
garantizando alta disponibilidad y tolerancia a fallos frente a la demanda de
usuarios. La propuesta de solución consiste en el diseño, desarrollo y
despliegue de "Semi-Social", una aplicación web tipo red social estructurada
sobre un clúster de servidores EC2 administrados por un balanceador de carga
(ELB), respaldada por bases de datos RDS y almacenamiento en S3, que además
integra servicios inteligentes como Cognito, Rekognition, Lambda, API Gateway,
Polly, Lex y Translate. A través de este proyecto, se pondrán en práctica
competencias específicas en diseño de infraestructura distribuida en la nube,
integración de servicios administrados de inteligencia artificial, procesamiento
serverless basado en eventos y configuración estricta de políticas de seguridad
cloud.

## 3. Enunciado del Proyecto

Amazon Web Services (AWS) es una plataforma de servicios de nube que ofrece
potencia de cómputo, almacenamiento y funcionalidad para ayudar a las empresas a
escalar.

Se desarrollará una aplicación web inspirada en redes sociales que permitirá
compartir publicaciones a los usuarios registrados. Tendrá las funcionalidades
de login, registro, visualización de publicaciones, comentarios, chat en tiempo
real y traducción de contenido.

### 3.1 Servicios a utilizar

Los servicios de AWS a utilizar son:

- IAM
- EC2
- S3
- Cognito
- Translate
- Rekognition
- Lambda
- API Gateway
- RDS (Relational Database Service)
- ELB (Elastic Load Balancing)
- Lex
- Polly

#### 3.1.1 Sitio web

A continuación, se detallarán las diferentes secciones o funcionalidades de la
aplicación web:

##### 1. Módulo de Registro

Para registrar un nuevo usuario obligatoriamente se pedirán los datos:

- Nombre completo
- Correo electrónico
- DPI
- Contraseña
- Repetir contraseña

La foto del usuario será obligatoria, esta se realizará eligiendo una imagen de
la computadora o tomando una foto con la webcam, ya que esta servirá para el
inicio de sesión haciendo uso de Rekognition. Esta sección deberá ser
implementada haciendo uso de Cognito.

##### 2. Módulo de Login

Para la autenticación se realizará por medio de las credenciales:

- nombre de usuario
- contraseña

O por medio de reconocimiento facial haciendo uso de Rekognition y la foto de
perfil del usuario. Esta sección deberá ser implementada haciendo uso de
Cognito.

##### 3. Página principal

###### Ver publicaciones

Se muestran todas las publicaciones que otros usuarios (solo amigos) han
realizado, también se muestran las del propio usuario. Todas se muestran
ordenadas por fecha de publicación de forma descendente (del más reciente al más
antiguo).

###### Comentarios

Cada publicación puede recibir comentarios de amigos.

###### Filtrar publicaciones

Se tendrá una lista de filtros, estas estarán basadas en las etiquetas de las
imágenes de las publicaciones obtenidas por la API de Amazon Rekognition.

El filtro "Todos" siempre aparecerá, los demás dependerán de las imágenes. Al
seleccionar una de estas sólo se mostrarán las publicaciones que tienen esa
etiqueta.

Además, se debe contar con un buscador de etiquetas, donde se puede ingresar el
nombre que se desea buscar.

###### Crear publicaciones

Se tendrá una sección donde se creará una nueva publicación, la publicación
tendrá:

- Imagen (obligatorio)
- Descripción (opcional)

###### Traducir publicaciones

La descripción y los comentarios de las publicaciones tendrán la opción de
"traducir" y "escuchar". Al realizar la acción de traducción, deberá de tener 3
idiomas disponibles además del español utilizando la API de Amazon Translate. Al
seleccionar la opción de "escuchar", el sistema reproducirá el texto (en su
idioma original o ya traducido) generando audio en tiempo real mediante la API
de Amazon Polly.

##### 4. Edición de Perfil

En esta sección, el usuario puede ver y modificar sus datos, tales como:

- Nombre completo
- DPI
- Foto de perfil

Se debe ingresar la contraseña correcta para que se guarden los datos
modificados.

##### 5. Usuarios y amigos

Para visualizar a los otros usuarios registrados, se debe de mostrar un apartado
donde se lista a los usuarios que no son amigos. Los usuarios que son amigos
solo se mostrarán en el Chat, que se describe más adelante.

La forma para agregar amigos será de la manera que funciona Facebook por lo que
se deberán manejar solicitudes de amistad con la posibilidad de aceptar o
rechazar.

##### 6. Chat

En esta sección, el usuario puede comunicarse con sus amigos.

Ambos usuarios amigos pueden enviar y recibir mensajes. Se recomienda utilizar
WebSockets para la comunicación en tiempo real.

#### 3.1.2 Infraestructura EC2 y Balanceador

Se deben configurar 2 instancias EC2 conectadas a un Application Load Balancer
(ELB). Ambas instancias deben tener la misma configuración y endpoints.

El servidor puede desarrollarse en Node.js y Python.

El balanceador distribuirá el tráfico de forma equitativa entre ambas
instancias.

NOTA: Tomar en cuenta la seguridad de las instancias EC2.

#### 3.1.3 Amazon RDS

No se permite el uso de bases de datos locales o en contenedores. Se debe
utilizar Amazon RDS (MySQL o PostgreSQL) para la persistencia de datos de la
aplicación.

#### 3.1.4 Imágenes en S3

Se debe configurar un bucket de S3 que contenga de nombre `semi1proyecto-g#`,
para el almacenamiento de imágenes, tales como las de las publicaciones y las
fotos de perfil de los usuarios.

#### 3.1.5 API Gateway y Función Lambda (Carga de Imágenes)

La carga de imágenes (tanto para fotos de perfil como para publicaciones) debe
realizarse obligatoriamente a través de un endpoint en API Gateway que dispare
una Función Lambda. Esta función se encargará de procesar el archivo y
almacenarlo en el bucket de S3.

#### 3.1.6 Amazon Lex (Bot)

El chatbot debe brindar información sobre la facultad de ingeniería (horarios,
preguntas frecuentes, etc.). Se valorará la integración de funciones Lambda para
respuestas dinámicas.

Deberá incluirse un botón de acceso al Bot (Amazon Lex) para consultas sobre la
facultad.

#### 3.1.7 Cognito

En este servicio se debe de configurar un pool de usuarios, de tal forma que
cada usuario registrado y que actualice sus datos en la aplicación también se
almacene en este pool, la forma de hacer la relación entre este pool de usuarios
y los datos a guardar en la BD queda a criterio de los estudiantes. Se debe de
tener como mínimo los siguientes datos:

- Nombre Completo
- Correo electrónico
- DPI
- Contraseña encriptada

Estos datos también deben de actualizarse cuando el usuario modifique sus datos
desde la aplicación. Es necesario implementar la verificación por correo
electrónico utilizando Cognito.

#### 3.1.8 Rekognition

Se utilizará para obtener una lista de etiquetas de las imágenes que se
publican, que se utilizarán para realizar los filtros de publicaciones y para el
login de la aplicación por medio de reconocimiento facial.

#### 3.1.9 Translate

Se utilizará para traducir el texto de las publicaciones en cualquier idioma al
español o viceversa.

#### 3.1.10 Configuración Polly (Reproducción de Texto)

Para la funcionalidad de "escuchar" el texto de las publicaciones, se debe
utilizar Amazon Polly. Con el objetivo de optimizar los tiempos de respuesta y
no sobrecargar la arquitectura con almacenamiento innecesario, la reproducción
del audio debe realizarse en tiempo real (streaming).

El backend (ya sea en las instancias EC2 o mediante una función Lambda) no debe
descargar ni guardar el archivo de audio (`.mp3`) en el bucket de S3. En su
lugar, el backend utilizará el SDK de AWS para generar y devolver al frontend
una "URL Prefirmada" directamente hacia el endpoint de Amazon Polly (ej.
`SynthesizeSpeech`).

El frontend recibirá esta URL de forma inmediata y la utilizará en una etiqueta
HTML5 nativa (`<audio src="...">`) para que el navegador del usuario descargue y
reproduzca el flujo de audio directamente desde AWS.

Asegurarse de que el usuario de IAM o el rol asignado al servidor backend cuente
con la política que permita la acción `polly:SynthesizeSpeech` para poder firmar
las solicitudes de manera exitosa.

#### 3.1.11 Seguridad

Deben de configurarse correctamente los security groups y los permisos que se le
asignen a los usuarios IAM.

Los endpoints de su servidor backend deben estar seguros, para ello se utilizará
JWT.

#### 3.1.12 Página Web

Puede ser realizada con cualquier librería, lenguaje o framework de programación
al criterio del estudiante, esta estará alojada en un Bucket de S3 público para
que se pueda acceder a cualquier momento y poder conectarse al balanceador de
carga, el Bucket debe de llevar el nombre de `Proyecto-Web-G#` (El # es el
número de grupo).

#### 3.1.13 Manual Técnico

Se necesita que se realice un manual de configuración redactado en Markdown
dentro del repositorio, lo único que debe de llevar este manual es lo siguiente:

- Datos de los estudiantes.
- Descripción de la arquitectura que utilizaron.
- Describir los usuarios IAM, permisos y roles utilizados para la elaboración
  del proyecto.
- Capturas de Pantalla:
  - Buckets de S3
  - EC2
  - Base de Datos RDS en su defecto.
  - Aplicación Web
  - Funciones Lambda
  - Pool Cognito
  - Configuración Amazon Flex
  - Check LoadBalancer

Pueden realizarlo en el `README.md` del repositorio.

### 3.2 Consideraciones

- La Página Web debe estar cargada como web estática en S3
- Repositorio en github en modo privado y documentado con el formato Markdown.
- Agregar como colaborador en el repositorio a los auxiliares de curso.
  - `elder1095`
  - `CarlosJezeh777`
- La práctica debe ser en grupos.
- Usar los respectivos usuarios de IAM con sus respectivas políticas de acuerdo
  con el servicio que se está utilizando. Por ejemplo:
  - Si se está utilizando S3 crear un usuario con las políticas respectivas.
  - Si se está utilizando EC2 crear el usuario con las políticas para este
    servicio.
- Se prohíbe modificar código o configuraciones dentro de la calificación.
- Toda la práctica debe ser desplegada en la nube con los servicios de AWS, no
  se aceptará nada local.

### 3.3 Entregables

| Tipo | Descripción |
| --- | --- |
| **Repositorio en GitHub** | Repositorio con el nombre `SEMINARIO1_A_2S2026_G#` que contenga la carpeta `Proyecto` y dentro de la misma el código fuente del proyecto y un archivo `README.md` con la descripción y capturas de las configuraciones de los servicios. |
| **Código Fuente** | Código de los servidores backend (Python o Javascript) y frontend. |

## 4. Valores

En el desarrollo de la práctica, se espera que cada estudiante demuestre
honestidad académica y profesionalismo. Por lo tanto, se establecen los
siguientes principios:

1. Originalidad del Trabajo
   - Cada estudiante o equipo debe desarrollar su propio código y/o
     documentación, aplicando los conocimientos adquiridos en el curso.
2. Prohibición de Copias y Plagio
   - Si se detecta la copia total o parcial del código, documentación o
     cualquier otro entregable, la calificación será de **0 puntos**.
   - Esto incluye la reproducción de código entre compañeros, la reutilización
     de proyectos de semestres anteriores o el uso de código externo sin la
     debida referencia.
3. Uso Responsable de Recursos Externos
   - El uso de bibliotecas, frameworks y ejemplos de código externos está
     permitido, siempre y cuando se referencien correctamente y se comprendan
     plenamente. (Consultar con el catedrático su política)

## 5. Material de apoyo

- [Subir backend NodeJS a AWS - EC2 (Oberg Agustin)](https://dev.to/agustinoberg/subir-backend-nodejs-a-aws-ec2-4nd5)
- [Creación de un balanceador de carga (AWS)](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-getting-started.html)
- [Configuración de un sitio web en S3 (AWS)](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
- Amazon RDS
  - <https://docs.aws.amazon.com/rds/>
  - <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/>
- AWS IAM
  - <https://docs.aws.amazon.com/iam/>
  - <https://docs.aws.amazon.com/IAM/latest/UserGuide>

## 6. Metodología

Para garantizar la correcta ejecución del desarrollo e implementación de la red
social en la nube, los grupos de trabajo deberán seguir un enfoque de desarrollo
estructurado en las siguientes fases:

- **Investigación preliminar:** Los estudiantes deben analizar la documentación
  oficial de AWS para comprender la integración y configuración de los servicios
  requeridos (EC2, S3, RDS, ELB, API Gateway, Lambda, Cognito, Rekognition,
  Translate y Lex). Asimismo, deben evaluar el uso de WebSockets para el chat en
  tiempo real y las mejores prácticas para el desarrollo con los frameworks
  frontend requeridos (React o Angular).
- **Diseño del sistema:** Antes de codificar, el equipo deberá estructurar la
  arquitectura cloud y diseñar el esquema relacional para Amazon RDS. Se deben
  definir los flujos de autenticación de usuarios (Cognito y login facial), las
  políticas de acceso (IAM) y la configuración de los grupos de seguridad.
- **Desarrollo:** La implementación se realizará de forma incremental. Primero,
  se desplegará la infraestructura base (VPC, instancias EC2 clónicas,
  balanceador de carga y base de datos). Posteriormente, se codificará el
  backend en Node.js y/o Python y el frontend como sitio estático en S3.
  Finalmente, se integrarán los microservicios y APIs de inteligencia artificial
  (Lambda, Rekognition, Translate, Lex).
- **Pruebas y ajustes:** El equipo deberá someter la arquitectura a pruebas de
  alta disponibilidad (por ejemplo, verificando que el balanceador redirige el
  tráfico correctamente). Se realizarán pruebas de carga de imágenes a través de
  API Gateway y Lambda hacia S3, validando que los procesos de registro,
  publicación y traducción funcionen sin errores antes de la entrega final.

## 7. Recursos y herramientas a utilizar

| Recurso | Categoría | Uso |
| --- | --- | --- |
| Python y/o Javascript | Software | Desarrollo del proyecto |
| GitHub | Plataforma | Repositorio |
| UEDI | Plataforma | Entrega |
| AWS | Plataforma | Despliegue cloud |
| Manuales de AWS | Lectura recomendada | Consulta |
| Artículos sobre despliegues cloud en su concepto general o sobre el uso de EC2, Load Balancer y S3 | Lectura recomendada | Consulta |

## 8. Desarrollo de Habilidades Blandas

Dado que el proyecto exige estrictamente el trabajo en grupos, su ejecución está
diseñada para fomentar las siguientes competencias transversales y
profesionales:

| Habilidad | Cómo se desarrolla |
| --- | --- |
| Trabajo en equipo y definición de roles | Dada la magnitud de la arquitectura, los estudiantes deberán delegar responsabilidades técnicas de manera eficiente (por ejemplo, dividiendo tareas de desarrollo frontend, configuración de infraestructura cloud e integración de APIs backend) para cumplir con las 30 horas estimadas de trabajo. |
| Comunicación | El equipo practicará la comunicación técnica asertiva mediante la integración continua de su código y la redacción clara del manual técnico en formato Markdown. Además, durante la fase de calificación, todos los integrantes deberán demostrar su participación respondiendo con dominio técnico a las preguntas sobre el flujo y arquitectura del sistema. |
| Resolución de conflictos y consenso | Los estudiantes se enfrentarán a desafíos de integración tecnológica compleja (como comunicar instancias EC2 con microservicios Lambda y RDS). Esto requerirá negociación interna para tomar decisiones arquitectónicas estables y solventar errores de despliegue mediante un análisis conjunto, fortaleciendo el valor de la perseverancia sin desmotivarse ante los fallos. |

## 9. Cronograma

El cronograma describe las etapas clave del proyecto, los plazos estimados para
cada una, y el proceso de asignación, elaboración y calificación de las tareas.
Los estudiantes deberán seguir este plan para asegurar que el proyecto avance de
manera organizada y cumpla con los plazos establecidos. Cada fase incluye la
asignación de tareas, el tiempo estimado para su elaboración, y el momento de su
calificación.

| Tarea | Fecha |
| --- | --- |
| Asignación de Proyecto | 22 de septiembre, 2026 |
| Elaboración | 22 de octubre, 2026 |
| Calificación | 24 de octubre, 2026 |

## 10. Rúbrica de Calificación

La rúbrica suma 100 puntos, repartidos en 40 de Habilidades y 60 de
Conocimiento. Los niveles de evaluación son *Satisfactorio* (100% - 61%) y
*Necesita mejorar* (60% - 0%).

### 10.1 Requisitos para optar a la calificación

Antes de la evaluación del proyecto, los estudiantes deben cumplir con los
requisitos que se indiquen en esta sección.

- **Cumplimiento de la tecnología establecida:** El desarrollo debe haberse
  realizado en Python y Javascript, además del uso de frameworks como react o
  angular.
- **Uso de herramientas requeridas:** La aplicación debe ejecutarse
  completamente en la nube de AWS, no hay nada local.
- **Gestión y entregas de práctica:** El repositorio en GitHub debe contener el
  código fuente y el README indicado.

### 10.2 Resumen de Puntuaciones

| Área | Puntos |
| --- | --- |
| **1. Habilidades** | |
| Configuración de IAM (usuarios, roles y políticas) | 5 |
| Bucket S3 para almacenamiento de imágenes | 5 |
| Configuración de la instancia EC2 No.1 | 5 |
| Configuración de la instancia EC2 No.2 | 5 |
| Configuración de Amazon RDS | 5 |
| Configuración de grupos de seguridad | 5 |
| Configuración correcta del balanceador | 5 |
| Hosting del sitio web | 5 |
| **Sub-Total Habilidades** | **40** |
| **2. Conocimiento** | |
| Cognito para registro y login | 7 |
| Rekognition para etiquetas y login facial | 6 |
| Lambda para procesamiento de imágenes | 4 |
| API Gateway para carga de imágenes | 4 |
| Translate para traducción de publicaciones | 4 |
| Lex chatbot integrado | 5 |
| Registro y autenticación de usuarios | 3 |
| Publicación de imágenes | 3 |
| Sistema de comentarios | 3 |
| Filtro de publicaciones por etiquetas | 3 |
| Chat entre usuarios | 3 |
| Documentación | 5 |
| Preguntas | 10 |
| **Sub-Total Conocimiento** | **60** |
| **TOTAL** | **100** |

### 10.3 Comentarios Generales

Toda la aplicación debe estar desplegada en la nube, todos los integrantes deben
participar y en caso de sospecha de copia, el estudiante deberá demostrar su
autoría en el trabajo, cualquier copia total o parcial será reportado a la
escuela de sistemas.

### 10.4 Detalle de la Calificación

#### Habilidades (40 puntos)

| No. | Criterio | Pts | Satisfactorio | Necesita mejorar |
| --- | --- | --- | --- | --- |
| 1.1 | Gestión de Identidad (IAM) | 5 | Se implementan usuarios y roles IAM específicos por servicio con políticas que garantizan la separación de responsabilidades. **(5–3)** | No se utilizan usuarios IAM o las políticas aplicadas no son adecuadas para la restricción de accesos. **(2–0)** |
| 1.2 | Configuración de S3 | 5 | El sitio web se despliega en S3. El bucket de imágenes contiene las carpetas `Fotos_Perfil` y `Fotos_Publicadas` con acceso público funcional. **(5–3)** | El acceso al sitio es deficiente o las carpetas de imágenes no cumplen con la estructura o permisos solicitados. **(2–0)** |
| 1.3 | Instancia EC2 No. 1 (Node.js) | 5 | La primera instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Node.js. **(5–3)** | No se desplegó la instancia o el servidor no se encuentra alojado correctamente en la máquina virtual. **(2–0)** |
| 1.4 | Instancia EC2 No. 2 (Python) | 5 | La segunda instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Python. **(5–3)** | No se desplegó la instancia o el servidor no responde a las peticiones del balanceador. **(2–0)** |
| 1.5 | Amazon RDS y Lógica | 5 | Base de datos RDS activa con esquema relacional funcional. Las contraseñas se almacenan encriptadas con el algoritmo MD5. **(5–3)** | No se utiliza RDS o las contraseñas están en texto plano. La lógica de tablas no soporta las funciones de la app. **(2–0)** |
| 1.6 | Grupos de Seguridad | 5 | Los grupos de seguridad están configurados para restringir el acceso a los puertos necesarios únicamente desde los endpoints autorizados. **(5–3)** | Las instancias de EC2 o RDS cuentan con configuraciones abiertas que comprometen el consumo de los servicios. **(2–0)** |
| 1.7 | Balanceador de Carga | 5 | El ALB distribuye tráfico a ambas EC2. Al detener una instancia, la aplicación sigue funcionando sin interrupción mediante el DNS del LB. **(5–3)** | El balanceador no cuenta con ambas instancias o el tráfico entre redes no funciona adecuadamente ante fallos. **(2–0)** |
| 1.8 | Hosting del sitio web | 5 | La página web está desplegada correctamente como sitio estático en S3 o en un servicio para front end y se conecta al backend mediante el balanceador. **(5–3)** | El sitio web no se encuentra desplegado correctamente o no puede comunicarse con los servicios backend. **(2–0)** |
| | **Sub-Total** | **40** | | |

#### Conocimiento (60 puntos)

| No. | Criterio | Pts | Satisfactorio | Necesita mejorar |
| --- | --- | --- | --- | --- |
| 2.1 | Cognito para registro y login | 7 | Se implementa Amazon Cognito para el registro, autenticación y verificación de usuarios mediante correo electrónico. **(7–4)** | No se utiliza Cognito o el registro/login no funciona correctamente. **(3–0)** |
| 2.2 | Rekognition para etiquetas y login facial | 6 | Se utiliza Rekognition para obtener etiquetas de imágenes y/o realizar autenticación mediante reconocimiento facial. **(6–4)** | No se implementa Rekognition o las etiquetas de imágenes no se generan correctamente. **(3–0)** |
| 2.3 | Lambda para procesamiento de imágenes | 4 | Las funciones Lambda procesan correctamente las imágenes cargadas y permiten su almacenamiento en S3. **(4–3)** | No se utiliza Lambda o las funciones no procesan correctamente los archivos. **(2–0)** |
| 2.4 | API Gateway para carga de imágenes | 4 | Se utiliza API Gateway para exponer endpoints que permitan la carga de imágenes mediante funciones. **(4–3)** | No se implementa API Gateway o los endpoints no funcionan correctamente. **(2–0)** |
| 2.5 | Translate para traducción de publicaciones | 4 | Se utiliza Amazon Translate para traducir publicaciones o comentarios a diferentes idiomas. **(4–3)** | No se utiliza Translate o la funcionalidad de traducción no funciona correctamente. **(2–0)** |
| 2.6 | Lex chatbot integrado | 5 | Se integra un chatbot funcional utilizando Amazon Lex que permite responder preguntas relacionadas con la facultad. **(5–4)** | El chatbot no se encuentra integrado o no responde correctamente. **(3–0)** |
| 2.7 | Autentificación (Registro/Login) | 3 | El registro y login funcionan correctamente utilizando autenticación segura y almacenamiento de datos del usuario. **(3–2)** | Existen errores en el registro o autenticación de usuarios. **(1–0)** |
| 2.8 | Publicación de imágenes | 3 | Los usuarios pueden crear publicaciones con imágenes que se almacenan correctamente en S3. **(3–2)** | Las publicaciones no se guardan o las imágenes no se almacenan correctamente. **(1–0)** |
| 2.9 | Sistema de comentarios | 3 | Las publicaciones permiten recibir comentarios de otros usuarios. **(3–2)** | No se pueden agregar comentarios o no se almacenan correctamente. **(1–0)** |
| 2.10 | Filtro de publicaciones por etiquetas | 3 | Las publicaciones pueden filtrarse mediante etiquetas generadas por Rekognition. **(3–2)** | No es posible gestionar la lista de películas favoritas o los enlaces multimedia no funcionan. **(1–0)** |
| 2.11 | Chat entre usuarios | 3 | Los usuarios pueden comunicarse mediante un chat funcional en tiempo real. **(3–2)** | El chat no funciona correctamente o no permite enviar y recibir mensajes. **(1–0)** |
| 2.12 | Documentación | 5 | El repositorio cuenta con el manual técnico detallado, incluyendo diagrama de arquitectura, políticas IAM y capturas de los servicios. **(5–3)** | El manual no se encuentra en el repositorio o carece de las evidencias de configuración y diagramas solicitados. **(2–0)** |
| 2.13 | Preguntas de Conocimiento | 10 | Todos los integrantes demuestran dominio técnico y participación al responder preguntas sobre la infraestructura y el flujo de la práctica. **(5–3)** | Ninguno de los estudiantes, o solo una parte del grupo, responde adecuadamente a las preguntas técnicas sobre el proyecto. **(2–0)** |
| | **Sub-Total** | **60** | | |
| | **TOTAL** | **100** | | |

<!-- markdownlint-configure-file { "MD013": { "tables": false } } -->
