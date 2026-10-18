#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
NEW_IMAGE="${1:-}"
[[ "$NEW_IMAGE" =~ ^[a-zA-Z0-9_./:@-]+$ ]] || { echo 'Usage: bash scripts/deploy-server.sh smartinvite:release-tag' >&2; exit 1; }
docker image inspect "$NEW_IMAGE" >/dev/null || { echo "Image missing on VPS: $NEW_IMAGE" >&2; exit 1; }
[[ -f .env ]] || { echo '.env missing' >&2; exit 1; }
OLD_IMAGE="$(sed -n 's/^APP_IMAGE=//p' .env | tail -1)"

# DB is started independently so initial migrations can run before app rollout.
docker compose up -d db
bash scripts/backup.sh
bash scripts/migrate.sh
sed -i "s|^APP_IMAGE=.*|APP_IMAGE=$NEW_IMAGE|" .env
chmod 600 .env

echo "Deploying $NEW_IMAGE ..."
docker compose up -d --no-deps app
READY=0
for i in {1..35}; do
  if docker compose exec -T app node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done
if [[ "$READY" != "1" ]]; then
  echo "New app failed health check; attempting image rollback to $OLD_IMAGE" >&2
  if [[ -n "$OLD_IMAGE" && "$OLD_IMAGE" != "$NEW_IMAGE" ]] && docker image inspect "$OLD_IMAGE" >/dev/null 2>&1; then
    sed -i "s|^APP_IMAGE=.*|APP_IMAGE=$OLD_IMAGE|" .env
    docker compose up -d --no-deps app
  fi
  echo 'Database migrations are NOT rolled back automatically.' >&2
  exit 1
fi

docker compose up -d caddy
printf '\nAPP READY. Check public endpoint: https://%s/api/health\n' "$(sed -n 's/^DOMAIN=//p' .env | head -1)"
docker compose ps
