#!/bin/bash
# Prepare este script para dejar el backend de Node.js corriendo con PM2 en una instancia EC2 o VM de Azure recien creada.
# Ejecutenlo desde la raiz de Practica_2 dentro de la instancia, una vez clonado el repositorio.
set -e

sudo apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2

cd Backend-node
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Completen Backend-node/.env con los datos reales de RDS, JWT y almacenamiento antes de iniciar."
fi

pm2 start src/server.js --name taskflow-node
pm2 save
pm2 startup
