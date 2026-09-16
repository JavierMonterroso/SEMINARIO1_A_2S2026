#!/bin/bash
# Prepare este script para dejar el backend de Python corriendo con systemd en una instancia EC2 o VM de Azure recien creada.
# Ejecutenlo desde la raiz de Practica_2 dentro de la instancia, una vez clonado el repositorio.
set -e

sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip

cd Backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Completen Backend-python/.env con los datos reales de RDS, JWT y almacenamiento antes de iniciar."
fi
deactivate
cd ..

sudo cp Deploy/taskflow-python.service /etc/systemd/system/taskflow-python.service
sudo systemctl daemon-reload
sudo systemctl enable taskflow-python
sudo systemctl start taskflow-python
