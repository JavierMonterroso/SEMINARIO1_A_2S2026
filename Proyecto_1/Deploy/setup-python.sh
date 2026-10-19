#!/usr/bin/env bash
# EC2 No.2 (Ubuntu): instala Python y deja el backend corriendo como servicio de systemd.
set -euo pipefail
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/Backend-Python"
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Completa Backend-Python/.env y vuelve a ejecutar este script."
  exit 1
fi
chmod 600 .env
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
venv/bin/python -c "from app.config import validate; validate()"
SERVICE_FILE="$(mktemp)"
trap 'rm -f "$SERVICE_FILE"' EXIT
sed -e "s|__BACKEND_DIR__|$PROJECT_ROOT/Backend-Python|g" -e "s|__SERVICE_USER__|$(id -un)|g" \
  "$PROJECT_ROOT/Deploy/semi-social-python.service" > "$SERVICE_FILE"
sudo install -m 644 "$SERVICE_FILE" /etc/systemd/system/semi-social-python.service
sudo systemctl daemon-reload
sudo systemctl enable semi-social-python
sudo systemctl restart semi-social-python
echo "Comprueba el backend: curl http://localhost:3000/api/health"
