#!/usr/bin/env bash
# Genera los .zip de las funciones Lambda para subirlos desde la consola.
set -euo pipefail
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/Lambdas/upload-image" && zip -q -j "$PROJECT_ROOT/Lambdas/upload-image.zip" index.mjs
cd "$PROJECT_ROOT/Lambdas/lex-facultad" && zip -q -j "$PROJECT_ROOT/Lambdas/lex-facultad.zip" lambda_function.py
echo "Listo: Lambdas/upload-image.zip y Lambdas/lex-facultad.zip"
