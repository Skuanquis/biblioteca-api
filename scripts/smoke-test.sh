#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
API_KEY="${API_KEY:-}"
URL="http://localhost:$PORT"
LIBROS="$URL/api/v1/libros"

node dist/biblioteca-api.cjs > app.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
trap 'echo "Fallo el smoke test"; cat app.log' ERR

for i in {1..30}; do
  if curl -fs "$URL/health" > /dev/null; then
    break
  fi
  echo "Esperando la API ($i)..."
  sleep 1
done

echo "GET /health"
curl -fs "$URL/health"
echo

echo "GET /api/v1/libros"
curl -fs "$LIBROS" > /dev/null

echo "POST /api/v1/libros"
LIBRO=$(curl -fs -X POST "$LIBROS" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"titulo":"El Aleph","autor":"Jorge Luis Borges","anio":1949}')
ID=$(echo "$LIBRO" | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0, 'utf8')).id)")
echo "$LIBRO"

echo "GET /api/v1/libros/$ID"
curl -fs "$LIBROS/$ID" > /dev/null

echo "PUT /api/v1/libros/$ID"
curl -fs -X PUT "$LIBROS/$ID" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"titulo":"El Aleph","autor":"Jorge Luis Borges","anio":1949,"disponible":false}'
echo

echo "DELETE /api/v1/libros/$ID"
curl -fs -X DELETE "$LIBROS/$ID" -H "x-api-key: $API_KEY"

CODIGO=$(curl -s -o /dev/null -w '%{http_code}' "$LIBROS/$ID")
if [ "$CODIGO" != "404" ]; then
  echo "El libro no se elimino (codigo $CODIGO)"
  exit 1
fi

echo "Smoke test OK"
