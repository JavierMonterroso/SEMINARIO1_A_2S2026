# CloudCinema — Seminario de Sistemas 1

> Universidad de San Carlos de Guatemala — Facultad de Ingeniería — Ingeniería en Ciencias y Sistemas

**Ponderación:** 15 pts&nbsp;&nbsp;·&nbsp;&nbsp;**Tiempo estimado:** 15 horas

## Índice

- [1. Marco Formativo](#1-marco-formativo)
  - [1.1. Valor](#11-valor)
  - [1.2. Competencia(s)](#12-competencias)
  - [1.3. Objetivo SMART](#13-objetivo-smart)
- [2. Enunciado de la Práctica](#2-enunciado-de-la-práctica)
  - [2.1 Descripción de módulos](#21-descripción-de-módulos)
    - [1. Módulo de Registro](#1-módulo-de-registro)
    - [2. Módulo de Login](#2-módulo-de-login)
    - [3. Galería de Exploración o Cartelera](#3-galería-de-exploración-o-cartelera)
    - [4. Edición de Perfil](#4-edición-de-perfil)
    - [5. Mi Lista de Reproducción](#5-mi-lista-de-reproducción)
    - [Implementación](#implementación)
  - [2.2 Alcance de la práctica](#22-alcance-de-la-práctica)
  - [2.3 Requerimientos técnicos](#23-requerimientos-técnicos)
    - [Almacenamiento S3](#almacenamiento-s3)
    - [Bases de Datos](#bases-de-datos)
    - [Servidores](#servidores)
    - [Balanceador de Carga](#balanceador-de-carga)
    - [Página Web](#página-web)
    - [Manual Técnico](#manual-técnico)
  - [2.4 Consideraciones](#24-consideraciones)
- [3. Valores](#3-valores)
- [4. Entregables](#4-entregables)
- [5. Material de apoyo](#5-material-de-apoyo)
- [6. Recursos y herramientas a utilizar](#6-recursos-y-herramientas-a-utilizar)
- [7. Cronograma](#7-cronograma)
- [8. Rúbrica de Calificación](#8-rúbrica-de-calificación)
  - [7.1 Requisitos para optar a la calificación](#71-requisitos-para-optar-a-la-calificación)
  - [7.2 Resumen de Puntuaciones](#72-resumen-de-puntuaciones)
  - [7.3 Comentarios Generales](#73-comentarios-generales)
  - [7.4 Detalle de la Calificación](#74-detalle-de-la-calificación)

## 1. Marco Formativo

### 1.1. Valor

| Nombre del valor | ¿Cómo se aplica en tu laboratorio? |
| --- | --- |
| Perseverancia | El estudiante fortalecerá este valor al trabajar en ejercicios desafiantes, fomentando múltiples intentos y analizando errores sin desmotivarse. |

### 1.2. Competencia(s)

Indique la competencia general del curso y la competencia específica trabajada en esta lectura.

| Tipo de competencia | Descripción |
| --- | --- |
| Competencia general | Aplica principios básicos de ingeniería, ciencias de computación y sistemas de información y comunicación, en la formulación y resolución adecuada de problemas complejos. |
| Competencia específica | - Capacidad para diseñar e implementar soluciones web distribuidas utilizando servicios de cómputo y balanceo de carga en la nube para garantizar la alta disponibilidad.<br>- Habilidad para aplicar políticas de seguridad y control de acceso mediante la configuración de roles de identidad y reglas de firewall virtual para proteger los recursos del sistema.<br>- Capacidad para integrar sistemas de almacenamiento de objetos y bases de datos relacionales en aplicaciones de múltiples lenguajes, optimizando el manejo de recursos multimedia. |

### 1.3. Objetivo SMART

| SMART | Definición | Objetivo redactado |
| --- | --- | --- |
| **Específico (¿Qué?)** | El objetivo es concreto y tangible. | Implementar una arquitectura de balanceo de carga que distribuya el tráfico entre dos instancias EC2 independientes (Node.js y Python). |
| **Medible (¿Cuánto?)** | El objetivo tiene una medida objetiva de éxito. | Lograr un 100% de disponibilidad de la plataforma al realizar pruebas de apagado manual de uno de los servidores en tiempo real. |
| **Alcanzable (¿Cómo?)** | El objetivo debe ser posible con los recursos disponibles. | Configurando un Application Load Balancer y grupos de seguridad que permitan la comunicación fluida entre los servicios de cómputo. |
| **Realista (¿Para qué?)** | El objetivo contribuye a metas más amplias. | Garantizar que los usuarios de CloudCinema puedan acceder a su lista de reproducción sin interrupciones. |
| **A Tiempo (¿Cuándo?)** | El objetivo tiene fecha límite o, mejor aún, un cronograma de hitos de progreso. | Completar la práctica en su totalidad (servidores backend, despliegue en EC2, configuración del balanceador y publicación del HTML en S3) en un plazo máximo de **15 días**. |

## 2. Enunciado de la Práctica

Una prestigiosa empresa del sector de entretenimiento multimedia planea expandir sus servicios digitales
introduciendo una plataforma de catálogo de cine para un nuevo nicho de mercado interesado en el coleccionismo
virtual. Para ello, lo han contratado a usted como ingeniero de soluciones en la nube para diseñar e implementar
una infraestructura robusta, escalable y de alta disponibilidad utilizando Amazon Web Services (AWS). La solución
debe permitir a los usuarios explorar una vasta biblioteca de títulos y gestionar su propia selección de películas
favoritas, garantizando que el servicio nunca se interrumpa mediante el uso de balanceo de carga y servidores
redundantes.

### 2.1 Descripción de módulos

Se recomienda utilizar los siguientes servicios de AWS:

- Identity and Access Management (IAM)
- Instancias EC2
- Security Groups
- Load Balancer (Balanceador de carga)
- Simple Storage Service (S3)
- Relational Database Service (RDS)

A continuación, se detallarán las diferentes secciones o funcionalidades de la aplicación web:

#### 1. Módulo de Registro

- **Correo electrónico:** debe ser único; el sistema validará que no existan dos cuentas con el mismo correo.
- **Nombre completo:** identificación personal del usuario.
- **Contraseña y confirmación:** se debe verificar que ambos campos coincidan antes de procesar el registro.
- **Foto de perfil:** el usuario puede elegir un archivo de su computadora o capturarla en el momento.

**Seguridad:** la contraseña debe ser encriptada mediante el algoritmo MD5 antes de ser almacenada.

#### 2. Módulo de Login

Sección para la autenticación de usuarios; únicamente se utilizarán las siguientes credenciales:

**Credenciales requeridas:**

- Correo electrónico.
- Contraseña.

Recomendación: validar el formato del correo antes de permitir el intento de inicio de sesión.

#### 3. Galería de Exploración o Cartelera

Es la sección principal donde se listan las películas almacenadas en la base de datos de la plataforma.

Cada elemento de la galería debe mostrar:

- **Póster:** imagen representativa alojada en S3.
- **Título de la película:** nombre oficial.
- **Director:** responsable de la obra (autor).
- **Año de estreno:** año de publicación original.
- **URL de contenido:** enlace funcional (ej. YouTube).
- **Estado:** indicador que defina si la película está "Disponible" o es un "Próximo estreno".

**Perspectiva del usuario:**

- **Estado (Disponible):** se habilita el botón "Agregar a mi lista de reproducción".
- **Estado (Próximo estreno):** el botón se deshabilita o se reemplaza por una etiqueta informativa.

**Nota:** la plataforma debe mostrar una notificación que indique que la película fue añadida a la lista de
reproducción.

#### 4. Edición de Perfil

Se tiene la potestad de modificar la información de su perfil; los campos a los que tendrá acceso a modificar
son los siguientes:

- **Campos editables:** nombre y foto de perfil.
- **Validación:** para guardar cualquier cambio, el sistema debe solicitar obligatoriamente la contraseña
  actual para verificar la identidad.

#### 5. Mi Lista de Reproducción

Aquí el usuario podrá gestionar su colección personal de películas disponibles; podrá visualizar las
películas y también eliminarlas de su colección.

- **Visualización:** lista de todas las películas que el usuario ha elegido de la galería principal.
- **Acceso al contenido:** al hacer clic en una película de la lista, el sistema debe redirigir al usuario a la
  URL de YouTube proporcionada en la ficha técnica.

**Se recomienda que esta sección esté organizada cronológicamente**, es decir, las películas añadidas más
recientemente deben ser las primeras en la lista.

#### Implementación

Para el desarrollo de esta aplicación web, se implementará una arquitectura como la siguiente:

> **Diagrama de arquitectura:** dentro de la nube de AWS, la App Web Pública envía las peticiones al Load
> Balancer, que distribuye el tráfico entre el Servidor Web/Node.js y el Servidor Web/Python. Ambos
> servidores se conectan al Bucket de Imágenes (S3) y a la Base de Datos (RDS).

### 2.2 Alcance de la práctica

- **Obligatorio:** dos servidores backend en instancias EC2 diferentes, tráfico correcto con la configuración
  de un balanceador de carga y despliegue con acceso correcto de un frontend en un bucket de S3, además de un
  Markdown con la documentación de la configuración de cada servicio.

### 2.3 Requerimientos técnicos

#### Almacenamiento S3

S3 actuará tanto como servidor de archivos estáticos para la página web como repositorio de imágenes.

- **Bucket de hosting:** se debe crear un bucket llamado **"Practica1-Web-G#"** (el # es el número de grupo,
  ej. Practica1-Web-G10) configurado para alojar el frontend de la aplicación.
- **Bucket de imágenes:** se utilizará el bucket **"Practica1-Images-G#"** (el # es el número de grupo, ej.
  Practica1-Images-G10) con dos carpetas internas:
  - **Fotos_Perfil:** todas las fotos de perfil de los usuarios se almacenarán en esta carpeta.
  - **Fotos_Peliculas:** se almacenarán todas las fotos de las películas, independientemente de si están o no
    adquiridas por algún usuario.
- **Permisos de acceso:** todas las imágenes dentro de este bucket deben ser públicas para que puedan ser
  visualizadas en la galería mediante su dirección URL.

**Sugerencia:** configurar la acción `s3:GetObject` de forma pública, con el fin de evitar tener que hacer
pública cada imagen de forma manual al subirla.

#### Bases de Datos

Para la base de datos de este proyecto se utilizará el servicio de RDS. Se recomienda utilizar un motor
relacional como MySQL o PostgreSQL para gestionar fácilmente las relaciones entre tablas.

- **Manejo de contraseñas:** es obligatorio que la contraseña del usuario se almacene encriptada mediante el
  algoritmo MD5.
- **Almacenamiento de medios:** está estrictamente prohibido guardar archivos binarios (imágenes) en la base
  de datos; solo se deben almacenar las URLs públicas proporcionadas por S3.

Por ejemplo: si la imagen está almacenada en la carpeta **"Fotos_Perfil"** y el nombre de la imagen es
**"foto1"**, entonces solo se deberá almacenar el siguiente registro: **"Fotos_Perfil/foto1.jpg"**; esto con el
fin de facilitar el trabajo de convertir imágenes.

#### Servidores

Se deben configurar dos instancias EC2 independientes, una con el backend en Node.js y otra en Python.

- **Uso de SDK:** ambos servidores deben utilizar el SDK de AWS oficial para interactuar con S3 (para la subida de
  fotos) y RDS.
- **Aislamiento:** la base de datos no debe estar instalada localmente en las instancias EC2; ambas instancias
  deben conectarse a la misma base de datos externa en RDS.
- **Security Groups:** deben estar configurados para permitir tráfico únicamente en los puertos que necesiten los
  servidores (ej. 80, 443 o puertos personalizados como el 3000).

**Sugerencia:** para el servidor de Python, utiliza Flask o FastAPI, y para Node.js utiliza Express. Deben
asegurarse de que ambos servidores expongan los mismos *endpoints* (ej. `/login`, `/register`, `/playlist`) para
que el balanceador trabaje de forma transparente.

#### Balanceador de Carga

Se puede configurar el balanceador de carga de diferentes formas; en esta ocasión utilizaremos el servicio de AWS
Load Balancing, que nos permitirá redirigir el tráfico de las peticiones a alguno de los servidores de las
instancias EC2. Este balanceador debe permitir lo siguiente:

- El balanceador debe estar configurado para redirigir las peticiones equitativamente entre las dos instancias EC2.
- La aplicación web debe seguir funcionando sin interrupciones si uno de los dos servidores es apagado manualmente.

#### Página Web

Puede ser realizada con cualquier librería, lenguaje o framework de programación a criterio del estudiante. Estará
alojada en un bucket de S3 público para que se pueda acceder en cualquier momento y conectarse al balanceador de
carga. El bucket debe llevar el nombre de **Practica1-Web-G#** (el # es el número de grupo).

#### Manual Técnico

Se necesita que se realice un manual de configuración redactado en Markdown dentro del repositorio. Lo único que
debe llevar este manual es lo siguiente:

- Datos de los estudiantes.
- Descripción de la arquitectura que utilizaron.
- Descripción de los diferentes usuarios de IAM que se utilizaron, con sus respectivas políticas.
- Capturas de pantalla:
  - Buckets de S3
  - EC2
  - Base de datos RDS, en su defecto.
  - Aplicación web

Pueden realizarlo en el `README.md` del repositorio.

### 2.4 Consideraciones

- La página web debe estar cargada como sitio web estático en S3.
- Repositorio en GitHub en modo privado y documentado con formato Markdown.
- Agregar como colaboradores en el repositorio a los auxiliares de curso:
  - elder1095
  - CarlosJezeh777
- La práctica debe realizarse en grupos.
- Usar los respectivos usuarios de IAM con sus respectivas políticas de acuerdo con el servicio que se está
  utilizando. Por ejemplo:
  - Si se está utilizando S3, crear un usuario con las políticas respectivas.
  - Si se está utilizando EC2, crear el usuario con las políticas para este servicio.
- Se prohíbe modificar código o configuraciones durante la calificación.
- Toda la práctica debe ser desplegada en la nube con los servicios de AWS; no se aceptará nada local.

## 3. Valores

En el desarrollo de la práctica, se espera que cada estudiante demuestre honestidad académica y profesionalismo.
Por lo tanto, se establecen los siguientes principios:

### 1. Originalidad del Trabajo

- Cada estudiante o equipo debe desarrollar su propio código y/o documentación, aplicando los conocimientos
  adquiridos en el curso.

### 2. Prohibición de Copias y Plagio

- Si se detecta la copia total o parcial del código, documentación o cualquier otro entregable, la calificación
  será de **0 puntos**.
- Esto incluye la reproducción de código entre compañeros, la reutilización de proyectos de semestres anteriores o
  el uso de código externo sin la debida referencia.

### 3. Uso Responsable de Recursos Externos

- El uso de bibliotecas, frameworks y ejemplos de código externos está permitido, siempre y cuando se referencien
  correctamente y se comprendan plenamente (consultar con el catedrático su política).

## 4. Entregables

| Tipo | Descripción |
| --- | --- |
| Repositorio en GitHub | Repositorio con el nombre **SEMINARIO1_A_2S2026_G#** que contenga la carpeta "Practica_1" y, dentro de la misma, el código fuente de la práctica y un archivo `README.md` con la descripción y capturas de las configuraciones de los servicios. |
| Código fuente | Código de los servidores backend (Python y JavaScript) y frontend. |

## 5. Material de apoyo

- **Subir backend Node.js a AWS EC2** (Oberg Agustín): [dev.to/agustinoberg/subir-backend-nodejs-a-aws-ec2-4nd5](https://dev.to/agustinoberg/subir-backend-nodejs-a-aws-ec2-4nd5)
- **Creación de un balanceador de carga (AWS):** [Guía de introducción a Classic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-getting-started.html)
- **Configuración de un sitio web en S3 (AWS):** [Alojamiento de un sitio web estático en S3](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)
- **Amazon RDS:**
  - [docs.aws.amazon.com/rds](https://docs.aws.amazon.com/rds/)
  - [Guía del usuario de Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- **AWS IAM:**
  - [docs.aws.amazon.com/iam](https://docs.aws.amazon.com/iam/)
  - [Guía del usuario de IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide)

## 6. Recursos y herramientas a utilizar

- **Software:** Python y/o JavaScript.
- **Plataformas:** GitHub (para repositorio), UEDI (para entrega), AWS (para despliegue cloud).
- **Lecturas recomendadas:** manuales de AWS, artículos sobre despliegues cloud en su concepto general, o artículos
  sobre el uso de EC2, Load Balancer y S3.

## 7. Cronograma

El cronograma describe las etapas clave de la práctica, los plazos estimados para cada una, y el proceso de
asignación, elaboración y calificación de las tareas. Los estudiantes deberán seguir este plan para asegurar que la
práctica avance de manera organizada y cumpla con los plazos establecidos. Cada fase incluye la asignación de
tareas, el tiempo estimado para su elaboración, y el momento de su calificación.

| Tarea | Fecha |
| --- | --- |
| Asignación de la práctica / entrega del enunciado | Agosto 4 de 2026 |
| Fecha de entrega | Agosto 20 de 2026 |
| Fecha de calificación | Agosto 22 de 2026 |

## 8. Rúbrica de Calificación

### 7.1 Requisitos para optar a la calificación

Antes de la evaluación de la práctica, los estudiantes deben cumplir con los requisitos que se indiquen en esta sección.

| Tema | Descripción | Cumple (Sí/No) |
| --- | --- | --- |
| Cumplimiento de la tecnología establecida | El desarrollo debe haberse realizado en Python y JavaScript, además del uso de frameworks como React o Angular. | |
| Uso de herramientas requeridas | La aplicación debe ejecutarse completamente en la nube de AWS; no hay nada local. | |
| Gestión y entregas de práctica | El repositorio en GitHub debe contener el código fuente y el README indicado. | |

### 7.2 Resumen de Puntuaciones

| Área | Puntos totales | Puntos obtenidos |
| --- | --- | --- |
| **1. Infraestructura AWS** | | |
| Gestión de Identidad (IAM) | 10 | |
| Configuración de la instancia S3 | 7 | |
| Configuración de la instancia EC2 No. 1 | 7 | |
| Configuración de la instancia EC2 No. 2 | 7 | |
| Configuración de Amazon RDS | 10 | |
| Configuración de grupos de seguridad | 7 | |
| Configuración correcta del balanceador | 12 | |
| **Sub-total Infraestructura** | **60** | |
| **2. Funcionalidad y Software** | | |
| Autentificación | 5 | |
| Perfil y edición | 7 | |
| Galería de exploración | 8 | |
| Mi lista de reproducción | 5 | |
| **Sub-total Conocimientos** | **25** | |
| **3. Documentación y Conocimiento** | | |
| Documentación | 5 | |
| Preguntas | 10 | |
| **TOTAL** | **100** | |

### 7.3 Comentarios Generales

Toda la aplicación debe estar desplegada en la nube; todos los integrantes deben participar y, en caso de sospecha
de copia, el estudiante deberá demostrar su autoría en el trabajo. Cualquier copia total o parcial será reportada a
la escuela de sistemas.

### 7.4 Detalle de la Calificación

#### 1. Infraestructura AWS (60 pts)

##### 1.1 Gestión de Identidad (IAM) — 10 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Se implementan usuarios y roles IAM específicos por servicio con políticas que garantizan la separación de responsabilidades. | 10 - 6 |
| Necesita mejorar (60% - 0%) | No se utilizan usuarios IAM o las políticas aplicadas no son adecuadas para la restricción de accesos. | 5 - 0 |

**Punteo obtenido:** ____ / 10

##### 1.2 Configuración de S3 — 7 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | El sitio web se despliega en S3. El bucket de imágenes contiene las carpetas Fotos_Perfil y Fotos_Publicadas con acceso público funcional. | 7 - 4 |
| Necesita mejorar (60% - 0%) | El acceso al sitio es deficiente o las carpetas de imágenes no cumplen con la estructura o permisos solicitados. | 3 - 0 |

**Punteo obtenido:** ____ / 7

##### 1.3 Instancia EC2 No. 1 (Node.js) — 7 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | La primera instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Node.js. | 7 - 4 |
| Necesita mejorar (60% - 0%) | No se desplegó la instancia o el servidor no se encuentra alojado correctamente en la máquina virtual. | 3 - 0 |

**Punteo obtenido:** ____ / 7

##### 1.4 Instancia EC2 No. 2 (Python) — 7 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | La segunda instancia cuenta con las configuraciones adecuadas para el despliegue funcional del backend en Python. | 7 - 4 |
| Necesita mejorar (60% - 0%) | No se desplegó la instancia o el servidor no responde a las peticiones del balanceador. | 3 - 0 |

**Punteo obtenido:** ____ / 7

##### 1.5 Amazon RDS y Lógica — 10 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Base de datos RDS activa con esquema relacional funcional. Las contraseñas se almacenan encriptadas con el algoritmo MD5. | 10 - 6 |
| Necesita mejorar (60% - 0%) | No se utiliza RDS o las contraseñas están en texto plano. La lógica de tablas no soporta las funciones de la app. | 5 - 0 |

**Punteo obtenido:** ____ / 10

##### 1.6 Grupos de Seguridad — 7 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Los grupos de seguridad están configurados para restringir el acceso a los puertos necesarios únicamente desde los endpoints autorizados. | 7 - 4 |
| Necesita mejorar (60% - 0%) | Las instancias de EC2 o RDS cuentan con configuraciones abiertas que comprometen el consumo de los servicios. | 3 - 0 |

**Punteo obtenido:** ____ / 7

##### 1.7 Balanceador de Carga — 12 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | El ALB distribuye tráfico a ambas EC2. Al detener una instancia, la aplicación sigue funcionando sin interrupción mediante el DNS del LB. | 12 - 7 |
| Necesita mejorar (60% - 0%) | El balanceador no cuenta con ambas instancias o el tráfico entre redes no funciona adecuadamente ante fallos. | 6 - 0 |

**Punteo obtenido:** ____ / 12

#### 2. Funcionalidad y Software (25 pts)

##### 2.1 Autentificación (Registro/Login) — 5 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | El registro por correo y el login funcionan correctamente, validando la unicidad del usuario y cargando la foto de perfil desde S3. | 5 - 3 |
| Necesita mejorar (60% - 0%) | Errores en el inicio de sesión o duplicidad de usuarios. La foto de perfil no se vincula dinámicamente. | 2 - 0 |

**Punteo obtenido:** ____ / 5

##### 2.2 Perfil y Edición — 7 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Es posible visualizar la información del usuario, editar nombre y foto mediante la validación obligatoria de la contraseña actual. | 7 - 4 |
| Necesita mejorar (60% - 0%) | La sección de perfil es estática o no permite la edición y actualización de datos e imágenes de forma segura. | 3 - 0 |

**Punteo obtenido:** ____ / 7

##### 2.3 Galería de Exploración — 8 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | La cartelera muestra pósteres y datos técnicos (Título, Director, Año, Estado) extraídos dinámicamente de la base de datos. | 8 - 5 |
| Necesita mejorar (60% - 0%) | La galería no carga las imágenes de S3 o falta información técnica esencial de las obras mostradas. | 4 - 0 |

**Punteo obtenido:** ____ / 8

##### 2.4 Mi Lista de Reproducción — 5 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Permite agregar películas "Disponibles" a la lista personal y redirige al enlace de YouTube para visualizar el contenido. | 5 - 3 |
| Necesita mejorar (60% - 0%) | No es posible gestionar la lista de películas favoritas o los enlaces multimedia no funcionan. | 2 - 0 |

**Punteo obtenido:** ____ / 5

#### 3. Documentación y Conocimiento (15 pts)

##### 3.1 Documentación — 5 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | El repositorio cuenta con el manual técnico detallado, incluyendo diagrama de arquitectura, políticas IAM y capturas de los servicios. | 5 - 3 |
| Necesita mejorar (60% - 0%) | El manual no se encuentra en el repositorio o carece de las evidencias de configuración y diagramas solicitados. | 2 - 0 |

**Punteo obtenido:** ____ / 5

##### 3.2 Preguntas de Conocimiento — 10 pts

| Nivel de evaluación | Descripción | Rango de punteo |
| --- | --- | --- |
| Satisfactorio (100% - 61%) | Todos los integrantes demuestran dominio técnico y participación al responder preguntas sobre la infraestructura y el flujo de la práctica. | 10 - 6 |
| Necesita mejorar (60% - 0%) | Ninguno de los estudiantes, o solo una parte del grupo, responde adecuadamente a las preguntas técnicas sobre el proyecto. | 5 - 0 |

**Punteo obtenido:** ____ / 10

**Punteo total de la práctica:** 100 puntos