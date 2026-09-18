# Despliegue en Microsoft Azure

Seccion A, Grupo 3. Equivalencias contra la parte de AWS:

| AWS | Azure |
|---|---|
| EC2 | Azure VM |
| Elastic Load Balancer | Azure Load Balancer (Standard) |
| S3 | Blob Storage (contenedores) |
| Lambda | Azure Functions |
| API Gateway | API Management (Consumption) |
| RDS | el mismo RDS de AWS |

## Orden de ejecucion

Correr `01-infra-azure.sh` por bloques en Cloud Shell. API Management va de primero
porque es lo unico que tarda; el resto se crea mientras provisiona.

Anotar lo que imprime el bloque 7, va directo al README principal.

## Montar los backends en las VMs

El repo es privado, asi que clonar con token:

```bash
ssh ubuntu@<ip-de-la-vm>
git clone https://<TOKEN>@github.com/JavierMonterroso/SEMINARIO1_A_2S2026.git
mv SEMINARIO1_A_2S2026/Practica_2 ~/Practica_2
```

El `mv` no es opcional: `Deploy/taskflow-python.service` apunta a
`/home/ubuntu/Practica_2/Backend-python`. Por eso las VMs se crean con el usuario
`ubuntu` y no con `azureuser`.

En vm-node:

```bash
cd ~/Practica_2
bash Deploy/setup-node.sh
```

En vm-python:

```bash
cd ~/Practica_2
bash Deploy/setup-python.sh
```

Antes de arrancar, llenar el `.env` de cada backend con los valores de Azure:

```
PORT=3000
DB_HOST=<endpoint del RDS>
DB_PORT=5432
DB_NAME=taskflow
DB_USER=<usuario>
DB_PASSWORD=<password>
JWT_SECRET=<el mismo en las 4 instancias>

STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=<la que imprimio el bloque 2>
AZURE_STORAGE_CONTAINER=practica2semi1a1s2026archivosg3
```

`JWT_SECRET` tiene que ser identico en los cuatro servidores (los dos de AWS y los
dos de Azure). Si no, el token que emite uno lo rechaza el otro y el balanceador
va a tirar al usuario de la sesion de forma aleatoria.

Comprobar en cada VM: `curl localhost:3000`. Los backends ya escuchan en 0.0.0.0
(uvicorn lo hace explicito y Express por defecto), asi que no hay que tocar nada.

## Probar el balanceador

```bash
curl http://<ip-del-lb>
az vm stop -g rg-practica2-g3 -n vm-node
curl http://<ip-del-lb>   # debe seguir respondiendo desde vm-python
az vm start -g rg-practica2-g3 -n vm-node
```

Esa prueba es la que pide el enunciado. Grabala o tomale captura.

## Desplegar las Azure Functions

Desde la maquina local, con Azure Functions Core Tools instalado
(`npm i -g azure-functions-core-tools@4 --unsafe-perm true`):

```bash
cd Practica_2/Serverless/azure-functions
npm install
func azure functionapp publish func-p2-g3
```

Quedan en `https://func-p2-g3.azurewebsites.net/api/upload/image` y `/api/upload/text`.
Estan en `authLevel: function`, o sea que piden clave. No hay que cambiarlo: al
importarlas en API Management, APIM guarda la clave y la manda por header.

## API Management

En el portal, sobre `apim-p2-g3`:

APIs > Add API > Function App > Browse > elegir `func-p2-g3` > seleccionar
UploadImage y UploadText > dejar el **API URL suffix vacio** > Create.

Con el suffix vacio las rutas quedan en
`https://apim-p2-g3.azure-api.net/upload/image` y `/upload/text`, que es
exactamente lo que espera `Frontend/js/config.js`.

Dos ajustes mas, sin ellos el frontend recibe 401 y errores de CORS:

1. Settings de la API: desmarcar "Subscription required" y guardar.
2. Design > All operations > icono `</>` de Inbound processing, dentro de `<inbound>`:

```xml
<cors allow-credentials="false">
  <allowed-origins><origin>*</origin></allowed-origins>
  <allowed-methods><method>*</method></allowed-methods>
  <allowed-headers><header>*</header></allowed-headers>
</cors>
```

## Subir el frontend

El frontend es HTML, CSS y JS plano, no hay build. Antes de subirlo hay que editar
`Frontend/js/config.js` con los valores de Azure:

```js
const CONFIG = {
  API_BASE_URL: 'http://<ip-del-lb>/api',
  UPLOAD_IMAGE_URL: 'https://apim-p2-g3.azure-api.net/upload/image',
  UPLOAD_TEXT_URL: 'https://apim-p2-g3.azure-api.net/upload/text',
};
```

Esa version de `config.js` es distinta a la de AWS, asi que conviene subir cada una
a su bucket sin commitear el cambio, o dejar dos copias del archivo.

```bash
STG=<cuenta de storage>
KEY=$(az storage account keys list -n $STG -g rg-practica2-g3 --query "[0].value" -o tsv)
az storage blob upload-batch --account-name $STG --account-key $KEY \
  -d practica2semi1a1s2026paginawebg3 -s Practica_2/Frontend --overwrite
```

Abrir `http://<stg>.blob.core.windows.net/practica2semi1a1s2026paginawebg3/index.html`

Tiene que ser **http**, no https. Una pagina servida por https no puede llamar al
balanceador, que va por http: el navegador lo bloquea por mixed content y no
muestra error visible, la app simplemente deja de responder. Por eso la cuenta de
storage se crea con `--https-only false`.

## Capturas que pide el enunciado

Tomarlas mientras se configura, no al final:

- Grupo de recursos completo
- Las dos VMs en la lista, corriendo
- NSG con las reglas de los puertos 22 y 3000
- Load Balancer: frontend IP, backend pool con las dos NICs, health probe en verde
- La app respondiendo con una VM apagada
- Storage account > Containers, los dos, con acceso publico
- Contenido de los dos contenedores
- Function App con UploadImage y UploadText
- API Management con las dos operaciones y la policy de CORS

## Al terminar

Las VMs cobran por hora encendidas. Despues de la calificacion:

```bash
az vm deallocate -g rg-practica2-g3 -n vm-node
az vm deallocate -g rg-practica2-g3 -n vm-python
```

No borrar el grupo de recursos hasta que el auxiliar califique.

## Errores que cuestan tiempo

El Load Balancer Standard niega todo por defecto. Si el NSG no tiene abierto el
3000, el health probe queda unhealthy y el balanceador devuelve timeout sin decir
por que.

El nombre de la cuenta de storage es unico a nivel mundial. Si dice que ya existe,
es porque alguien mas lo tiene; el script le agrega un numero aleatorio.

Los contenedores no aceptan mayusculas. El enunciado escribe `practica2Semi1` y
`Archivosg#`; en Azure van todos en minusculas. Vale la pena anotarlo en el README
principal para que no lo cuenten como error.

La cuota del free trial son 4 vCPU por region. Dos B1s son 2 vCPU y entran bien,
pero un tamano mas grande falla con error de cuota.

"Allow blob anonymous access" viene apagado en cuentas nuevas. Sin eso las imagenes
no cargan aunque el contenedor diga publico; el script ya lo activa.
