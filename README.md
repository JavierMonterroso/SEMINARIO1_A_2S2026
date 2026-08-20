# Cloud Cinema — Manual (Práctica 1)

## Datos de los estudiantes

| Nombre completo | Carnet |
| --- | --- |
| Hernán Ricardo Ávila Castillo | 9516085 |
| Javier Andrés Monterroso García | 202102140 |
| Daved Abshalon Ejcalon Chonay | 202105668 |

---

## Arquitectura

Implementamos una arquitectura de dos backends redundantes: uno en Node.js/Express y otro en Python/FastAPI, cada uno desplegado en su propia instancia EC2. Decidimos que ambas APIs expusieran exactamente el mismo contrato de endpoints para poder colocarlas detrás de un mismo Application Load Balancer (ALB); así, si apagamos una de las dos instancias, el balanceador sigue enrutando hacia la otra sin que el usuario note la diferencia. Los dos backends se conectan a la misma base de datos PostgreSQL en Amazon RDS y al mismo bucket de S3 de imágenes. El frontend lo construimos con HTML/CSS/JavaScript plano, sin frameworks ni paso de build, y lo alojamos como sitio web estático en un segundo bucket de S3, apuntando siempre al DNS del balanceador para sus peticiones a la API.

---

## Usuarios de IAM

Configuramos usuarios de IAM separados según el recurso que administran, para no compartir credenciales entre servicios.

- **IAM Frontend:** usuario dedicado a publicar y actualizar los archivos del sitio estático en el bucket de S3 del frontend.
- **IAM Backend:** credenciales usadas por las instancias EC2 para que ambos backends puedan subir imágenes (fotos de perfil y pósters) al bucket de S3 de imágenes.
- **IAM Datos:** usuario dedicado a la administración de la base de datos en RDS.

---

## Capturas de pantalla

### Buckets de S3

![Instancias S3 de web e imágenes](https://i.ibb.co/TMJFbvNQ/00-Se-muestra-las-2-instancias-S3-con-sus-respectivos-nombres-de-web-e-imagenes-segun-la-nomenclat.png)
*Las dos instancias de S3, con sus respectivos nombres de bucket (web e imágenes) según la nomenclatura solicitada.*

![Objetos del bucket web](https://i.ibb.co/35ttCDrW/01-Se-muestras-los-objetos-de-la-instancia-web.png)
*Objetos almacenados en el bucket del frontend.*

![Bucket S3 del frontend](https://i.ibb.co/spGyJzSG/04-Se-muestra-la-instancia-s3-que-contiene-el-codigo-del-frontend.png)
*Configuración del bucket de S3 que aloja el código del frontend.*

![Imágenes de películas en S3](https://i.ibb.co/QjHcD841/02-Se-muestran-las-imagenes-contenidas-del-S3-peliculas.png)
*Imágenes de películas almacenadas en el bucket de S3.*

![Imágenes de perfil en S3](https://i.ibb.co/SwBfy2GN/03-Se-muestras-las-imagenes-de-perfil-de-los-usuarios-estos-se-suben-y-se-almacenan-en-la-web.png)
*Imágenes de perfil de los usuarios; se suben y se almacenan desde la web.*

### Instancias EC2

![Instancias EC2 del backend](https://i.ibb.co/hxdxkMMT/04-Se-muestran-las-instancias-EC2-en-backend.png)
*Las dos instancias EC2 utilizadas para los backends (Node.js y Python).*

### Base de datos RDS

![Instancia RDS](https://i.ibb.co/TB98yb6W/05-Se-muestra-la-instancia-RDS-de-la-base-de-datos.png)
*Instancia de RDS que aloja la base de datos PostgreSQL.*

### Aplicación web

![Página principal](https://i.ibb.co/0pntg8Ww/06-Bashboard-principal.png)
*Página principal / inicio de sesión de la aplicación.*

![Cartelera de películas](https://i.ibb.co/PsWg4mx2/07-Dashboard-cartelera-de-peliculas.png)
*Cartelera de películas.*

![Lista de reproducción](https://i.ibb.co/wNMqt4dX/08-Dashboard-peliculas-favoritas.png)
*Lista de reproducción (películas favoritas) del usuario.*

![Perfil de usuario](https://i.ibb.co/chqRKz0w/09-Dashboard-perfil-de-usuario.png)
*Perfil de usuario.*
