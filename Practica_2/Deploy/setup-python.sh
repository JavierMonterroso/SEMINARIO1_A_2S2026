#!/usr/bin/env bash
set -euo pipefail
TASKFLOW_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TASKFLOW_ROOT/Backend-python"
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Completa DB_PASSWORD y JWT_SECRET en Backend-python/.env y vuelve a ejecutar este script."
  exit 1
fi
chmod 600 .env
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
venv/bin/python -c "from app.config import validate; validate()"
TASKFLOW_SERVICE_FILE="$(mktemp)"
trap 'rm -f "$TASKFLOW_SERVICE_FILE"' EXIT
venv/bin/python - "$TASKFLOW_ROOT" "$(id -un)" "$TASKFLOW_SERVICE_FILE" <<'SERVICE'
from pathlib import Path
import sys
root, user, target = sys.argv[1:]
backend = str(Path(root) / 'Backend-python')
# Escapar rutas para la sintaxis de systemd.
backend = backend.replace('\\', '\\\\').replace('"', '\\"').replace('%', '%%')
content = (Path(root) / 'Deploy/taskflow-python.service').read_text()
Path(target).write_text(content.replace('__BACKEND_DIR__', backend).replace('__SERVICE_USER__', user))
SERVICE
sudo install -m 644 "$TASKFLOW_SERVICE_FILE" /etc/systemd/system/taskflow-python.service
sudo systemctl daemon-reload
sudo systemctl enable taskflow-python
sudo systemctl restart taskflow-python
echo "Comprueba el backend: curl http://localhost:3000/api/health"
