#!/usr/bin/env bash
set -euo pipefail
TASKFLOW_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TASKFLOW_ROOT/Backend-node"
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Completa DB_PASSWORD y JWT_SECRET en Backend-node/.env y vuelve a ejecutar este script."
  exit 1
fi
chmod 600 .env
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm ci
node -e "require('dotenv').config(); const missing=['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD','JWT_SECRET'].filter(k=>!process.env[k]?.trim()); if(missing.length){console.error('Completa .env: '+missing.join(', '));process.exit(1);}"
sudo npm install -g pm2
pm2 startOrRestart "$TASKFLOW_ROOT/Deploy/ecosystem.config.js" --only taskflow-node --update-env
TASKFLOW_USER="$(id -un)"
TASKFLOW_USER_HOME="$(getent passwd "$TASKFLOW_USER" | cut -d: -f6)"
sudo env PATH="$PATH" pm2 startup systemd -u "$TASKFLOW_USER" --hp "$TASKFLOW_USER_HOME"
pm2 save
echo "Comprueba el backend: curl http://localhost:3000/api/health"
