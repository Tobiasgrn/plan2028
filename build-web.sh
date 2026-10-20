#!/usr/bin/env bash
# Pakker web/index.html ind i Android-appen som en komplet HTML-side.
set -euo pipefail
cd "$(dirname "$0")"
out="android/app/src/main/assets/index.html"
mkdir -p "$(dirname "$out")"
{
  printf '%s' '<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
  cat web/index.html
  printf '%s\n' '</body></html>'
} > "$out"
echo "Skrev $out"
