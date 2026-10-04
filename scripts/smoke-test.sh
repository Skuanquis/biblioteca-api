#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
URL="http://localhost:$PORT"

node dist/biblioteca-api.cjs > app.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT

for i in {1..30}; do
  if curl -fs "$URL/health" > /dev/null; then
    break
  fi
  echo "Esperando la API ($i)..."
  sleep 1
done

if ! curl -fs "$URL/health"; then
  echo "La API no respondio"
  cat app.log
  exit 1
fi
echo

echo "Smoke test OK"
