#!/usr/bin/env bash
# EC2 No.1 (Ubuntu): instala Node.js y deja el backend corriendo con pm2.
set -euo pipefail
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/Backend-Node"
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Completa Backend-Node/.env y vuelve a ejecutar este script."
  exit 1
fi
chmod 600 .env
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm ci
sudo npm install -g pm2
pm2 startOrRestart "$PROJECT_ROOT/Deploy/ecosystem.config.js" --only semi-social-node --update-env
SERVICE_USER="$(id -un)"
SERVICE_USER_HOME="$(getent passwd "$SERVICE_USER" | cut -d: -f6)"
sudo env PATH="$PATH" pm2 startup systemd -u "$SERVICE_USER" --hp "$SERVICE_USER_HOME"
pm2 save
echo "Comprueba el backend: curl http://localhost:3000/api/health"
