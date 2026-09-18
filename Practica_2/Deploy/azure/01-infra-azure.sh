#!/usr/bin/env bash
# TaskFlow + CloudDrive - Practica 2 - Seccion A, Grupo 3
# Infraestructura de Microsoft Azure.
# Correr en Azure Cloud Shell (bash), bloque por bloque. No de un solo golpe.
set -euo pipefail

########################################
# Variables
########################################
SEC="a"
G="3"
LOC="eastus"
RG="rg-practica2-g${G}"

# Nombres del enunciado. Azure obliga minusculas en nombres de contenedor.
CONT_WEB="practica2semi1${SEC}1s2026paginawebg${G}"
CONT_FILES="practica2semi1${SEC}1s2026archivosg${G}"

# Cuenta de storage: maximo 24 caracteres, solo minusculas y digitos, unica en el mundo.
STG="p2s1${SEC}g${G}${RANDOM}"

VNET="vnet-p2"
SNET="snet-back"
NSG="nsg-back"
VM_NODE="vm-node"
VM_PY="vm-python"
LB="lb-p2"
APIM="apim-p2-g${G}"
FUNC="func-p2-g${G}"
APP_PORT=3000   # es el puerto que ya usan Backend-node y Backend-python

echo "Cuenta de storage que se va a crear: $STG"

########################################
# 0. Login y proveedores
########################################
az login
az account show -o table
az provider register --namespace Microsoft.ApiManagement
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Network

az group create -n "$RG" -l "$LOC"

########################################
# 1. API Management primero: tarda mas que todo lo demas.
#    Consumption es el tier barato y rapido. Developer tarda 30 a 90 min y cuesta ~50 USD/mes.
########################################
az apim create -n "$APIM" -g "$RG" -l "$LOC" \
  --sku-name Consumption \
  --publisher-email "hricardoavilac@gmail.com" \
  --publisher-name "Grupo 3 Semi1 A" \
  --no-wait

########################################
# 2. Storage: cuenta y los dos contenedores publicos
#    https-only queda en false para poder servir la web por http y que pueda
#    llamar al balanceador, que solo habla http.
########################################
az storage account create -n "$STG" -g "$RG" -l "$LOC" \
  --sku Standard_LRS --kind StorageV2 \
  --allow-blob-public-access true \
  --https-only false \
  --min-tls-version TLS1_0

KEY=$(az storage account keys list -n "$STG" -g "$RG" --query "[0].value" -o tsv)

az storage container create --account-name "$STG" --account-key "$KEY" -n "$CONT_WEB"   --public-access blob
az storage container create --account-name "$STG" --account-key "$KEY" -n "$CONT_FILES" --public-access blob

CONN=$(az storage account show-connection-string -n "$STG" -g "$RG" --query connectionString -o tsv)
echo "AZURE_STORAGE_CONNECTION_STRING=$CONN"
echo "AZURE_STORAGE_CONTAINER=$CONT_FILES"

########################################
# 3. Red: VNet, subred y NSG con solo los puertos que el servidor necesita
########################################
az network vnet create -g "$RG" -n "$VNET" \
  --address-prefix 10.0.0.0/16 \
  --subnet-name "$SNET" --subnet-prefix 10.0.1.0/24

az network nsg create -g "$RG" -n "$NSG"

az network nsg rule create -g "$RG" --nsg-name "$NSG" -n allow-ssh \
  --priority 100 --protocol Tcp --destination-port-ranges 22 --access Allow

az network nsg rule create -g "$RG" --nsg-name "$NSG" -n allow-app \
  --priority 110 --protocol Tcp --destination-port-ranges "$APP_PORT" --access Allow

########################################
# 4. Dos VMs Ubuntu 22.04 B1s.
#    Usuario "ubuntu" a proposito: Deploy/taskflow-python.service apunta a /home/ubuntu.
########################################
IMG="Canonical:0001-com-ubuntu-server-jammy:22_04-lts-gen2:latest"

az vm create -g "$RG" -n "$VM_NODE" --image "$IMG" --size Standard_B1s \
  --vnet-name "$VNET" --subnet "$SNET" --nsg "$NSG" \
  --public-ip-sku Standard --admin-username ubuntu --generate-ssh-keys

az vm create -g "$RG" -n "$VM_PY" --image "$IMG" --size Standard_B1s \
  --vnet-name "$VNET" --subnet "$SNET" --nsg "$NSG" \
  --public-ip-sku Standard --admin-username ubuntu --generate-ssh-keys

IP_NODE=$(az vm show -d -g "$RG" -n "$VM_NODE" --query publicIps -o tsv)
IP_PY=$(az vm show -d -g "$RG" -n "$VM_PY" --query publicIps -o tsv)
echo "IP vm-node:   $IP_NODE"
echo "IP vm-python: $IP_PY"
echo ">> Pasarle estas dos IPs al encargado de AWS para que las abra en el"
echo ">> security group del RDS en el puerto 5432."

########################################
# 5. Load Balancer Standard
########################################
az network public-ip create -g "$RG" -n pip-lb --sku Standard --allocation-method Static

az network lb create -g "$RG" -n "$LB" --sku Standard \
  --public-ip-address pip-lb --frontend-ip-name fe --backend-pool-name bepool

# Probe TCP, no necesita endpoint /health en el codigo.
az network lb probe create -g "$RG" --lb-name "$LB" -n probe-app \
  --protocol Tcp --port "$APP_PORT"

az network lb rule create -g "$RG" --lb-name "$LB" -n rule-http \
  --protocol Tcp --frontend-port 80 --backend-port "$APP_PORT" \
  --frontend-ip-name fe --backend-pool-name bepool --probe-name probe-app \
  --idle-timeout 4 --enable-tcp-reset true

az network nic ip-config address-pool add -g "$RG" \
  --nic-name "${VM_NODE}VMNic" --ip-config-name "ipconfig${VM_NODE}" \
  --lb-name "$LB" --address-pool bepool

az network nic ip-config address-pool add -g "$RG" \
  --nic-name "${VM_PY}VMNic" --ip-config-name "ipconfig${VM_PY}" \
  --lb-name "$LB" --address-pool bepool

IP_LB=$(az network public-ip show -g "$RG" -n pip-lb --query ipAddress -o tsv)
echo "Balanceador Azure: http://${IP_LB}"

########################################
# 6. Function App con las variables que espera Serverless/azure-functions
########################################
az functionapp create -g "$RG" -n "$FUNC" \
  --storage-account "$STG" \
  --consumption-plan-location "$LOC" \
  --runtime node --runtime-version 20 --functions-version 4 \
  --os-type Linux

az functionapp config appsettings set -g "$RG" -n "$FUNC" --settings \
  "AZURE_STORAGE_CONNECTION_STRING=$CONN" \
  "AZURE_STORAGE_CONTAINER=$CONT_FILES"

az functionapp cors add -g "$RG" -n "$FUNC" --allowed-origins "*"

########################################
# 7. Resumen para el README
########################################
cat <<EOF

=== Despliegue Azure - Grupo 3 ===
Resource group  : $RG
Region          : $LOC
Storage account : $STG
Contenedor web  : $CONT_WEB
Contenedor arch : $CONT_FILES
Web estatica    : http://${STG}.blob.core.windows.net/${CONT_WEB}/index.html
VM Node         : $IP_NODE
VM Python       : $IP_PY
Balanceador     : http://${IP_LB}
Function App    : https://${FUNC}.azurewebsites.net
API Management  : https://${APIM}.azure-api.net
EOF
