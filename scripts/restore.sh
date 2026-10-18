#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
DUMP="${1:-}"
MEDIA="${2:-}"
[[ -f "$DUMP" ]] || { echo 'Usage: RESTORE_CONFIRM=YES bash scripts/restore.sh /path/db.dump [/path/uploads.tar.gz]' >&2; exit 1; }
[[ "${RESTORE_CONFIRM:-}" == "YES" ]] || { echo 'Refusing restore without RESTORE_CONFIRM=YES (destructive).' >&2; exit 1; }
[[ -z "$MEDIA" || -f "$MEDIA" ]] || { echo 'Media archive does not exist.' >&2; exit 1; }

echo 'WARNING: restoring REPLACES the current smartinvite database.'
docker compose stop app
# The SQL connections below use Unix sockets as the PostgreSQL superuser inside the container.
docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='smartinvite' AND pid <> pg_backend_pid();"
docker compose exec -T db dropdb -U postgres --if-exists smartinvite
docker compose exec -T db createdb -U postgres -O postgres smartinvite
docker compose exec -T db psql -U postgres -d smartinvite -v ON_ERROR_STOP=1 -c \
  'GRANT CONNECT ON DATABASE smartinvite TO smartinvite; GRANT USAGE, CREATE ON SCHEMA public TO smartinvite;'
cat "$DUMP" | docker compose exec -T db pg_restore -U postgres --role=smartinvite -d smartinvite --no-owner --no-acl --exit-on-error
if [[ -n "$MEDIA" ]]; then
  tar -C "$ROOT" -xzf "$MEDIA" uploads
fi
docker compose up -d --no-deps app
echo 'Restore finished. Verify HTTPS, app health and guest records manually.'
