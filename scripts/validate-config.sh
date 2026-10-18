#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ -f .env ]] || { echo 'Missing .env' >&2; exit 1; }
chmod 600 .env
if grep -Eq '^((PG_SUPER_PASSWORD|APP_DB_PASSWORD|AUTH_SECRET)=REPLACE_|DOMAIN=invite\.example\.com)' .env; then
  echo 'ERROR: .env still has placeholder credentials or domain' >&2
  exit 1
fi
docker compose config --quiet
docker compose run --rm --no-deps caddy validate --config /etc/caddy/Caddyfile
printf 'Docker Compose and Caddy configuration accepted.\n'
