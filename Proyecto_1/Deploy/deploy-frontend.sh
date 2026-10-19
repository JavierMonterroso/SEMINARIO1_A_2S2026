#!/usr/bin/env bash
# Compila el frontend y lo sube al bucket de hosting estatico.
# Uso: ./deploy-frontend.sh proyecto-web-g# [perfil-aws]
set -euo pipefail
BUCKET="${1:?Indica el nombre del bucket web}"
PROFILE="${2:-default}"
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/Frontend"
if [ ! -f .env ]; then
  echo "Crea Frontend/.env a partir de .env.example con el DNS del balanceador."
  exit 1
fi
npm ci
npm run build
aws s3 sync dist "s3://$BUCKET" --delete --profile "$PROFILE"
echo "Sitio: http://$BUCKET.s3-website-$(aws configure get region --profile "$PROFILE").amazonaws.com"
