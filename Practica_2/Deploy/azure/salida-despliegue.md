# Salida del despliegue Azure — Grupo 3

Datos para llenar el README final. Sin claves ni connection strings.

- Suscripción: `Azure subscription 1` (usuario `hernanavilagt@outlook.es`)
- Resource group: `rg-practica2-g3`
- Región: `eastus`
- Storage account: `p2s1ag321855`
- Contenedor web: `practica2semi1a1s2026paginawebg3`
- Contenedor archivos: `practica2semi1a1s2026archivosg3`
- API Management: `apim-p2-g3` (Consumption, activándose)

- VM Node (`vm-node`): `20.124.83.161` — zona 3, `Standard_B1s`
- VM Python (`vm-python`): `172.210.65.182` — zona 3, `Standard_B1s`

Nota importante: la suscripción tuvo que pasar de Free Trial a Pay-As-You-Go
(mismos $200 de crédito) porque las cuentas free trial recién creadas no
tienen acceso a capacidad de cómputo por unas horas/días. Aun tras el upgrade,
solo la zona de disponibilidad 3 de `eastus` tuvo capacidad para `Standard_B1s`
(las zonas 1 y 2 seguían sin capacidad). Por eso ambas VMs se crearon con
`--zone 3`.

- Balanceador (`lb-p2`): `http://20.119.63.90`

- Function App (`func-p2-g3`): `https://func-p2-g3.azurewebsites.net`. Funciones
  publicadas y probadas (`UploadText` responde y sube a blob correctamente):
  - `https://func-p2-g3.azurewebsites.net/api/upload/image`
  - `https://func-p2-g3.azurewebsites.net/api/upload/text`
  Nota: hubo que fijar el runtime en **Node 22** (`--linux-fx-version Node|22`);
  Node 24 dejaba el host completo en 503 Service Unavailable en el plan
  Consumption de Linux (posible falta de madurez de esa imagen en este plan).
- API Management (`apim-p2-g3`): `https://apim-p2-g3.azure-api.net` (creado, aún sin importar las funciones — paso manual en portal)

- Web estática: `http://p2s1ag321855.blob.core.windows.net/practica2semi1a1s2026paginawebg3/index.html`
- API Management API creada, sin "Subscription required", con CORS configurado.
  Endpoints probados y funcionando:
  - `https://apim-p2-g3.azure-api.net/upload/image`
  - `https://apim-p2-g3.azure-api.net/upload/text`

## Estado de los backends (VMs)

- `vm-node`: repo clonado, `.env` completo, Node 22 + PM2 configurado con
  auto-restart y auto-start en boot. Bloqueado esperando acceso al RDS.
- `vm-python`: repo clonado, `.env` completo, Python 3.10 venv + systemd
  configurado con auto-restart y auto-start en boot. Bloqueado esperando
  acceso al RDS.
- **Pendiente del compañero de AWS**: abrir el puerto 5432 del security group
  del RDS a las IPs `20.124.83.161` (vm-node) y `172.210.65.182` (vm-python).
  Confirmado con test de conexión TCP cruda: timeout, no es problema de
  credenciales.

## Bug de código detectado (no es de infraestructura, pasar al compañero de código)

El frontend actualizado (`Frontend/js/api.js`) manda a las funciones de carga
los campos `filename`/`image` (imágenes) o `filename`/`content` (texto), pero
tanto `Serverless/aws-lambda/validation.js` como
`Serverless/azure-functions/shared/validation.js` siguen esperando
`fileName`/`contentType`/`data` (base64). Esto rompe la carga de archivos y el
registro con foto en **ambas nubes** hasta que se actualice el contrato en
alguno de los dos lados.

## Datos de RDS (compartidos por el compañero de AWS, vía `Docs/MANUAL-TECNICO-API.md`)

- Host: `taskflow-db.clagayom87id.us-east-2.rds.amazonaws.com`
- Puerto: `5432`
- Base de datos: `taskflow_db`
- Usuario: `taskflowadmin`
- Password: pedir al compañero de AWS al momento de configurar las VMs (no se
  guarda aquí).
