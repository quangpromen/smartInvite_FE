#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

sql() {
  docker compose exec -T db sh -c \
    'export PGPASSWORD="$APP_DB_PASSWORD"; exec psql -h 127.0.0.1 -U smartinvite -d smartinvite -X -v ON_ERROR_STOP=1 "$@"' \
    sh "$@"
}

sql -c 'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())' >/dev/null
shopt -s nullglob
for file in db/migrations/*.sql; do
  name="$(basename "$file")"
  [[ "$name" =~ ^[0-9]{3}_[a-z0-9_]+\.sql$ ]] || { echo "Invalid migration name: $name" >&2; exit 1; }
  applied="$(sql -Atc "SELECT 1 FROM schema_migrations WHERE name = '$name'" | tr -d '\r\n')"
  if [[ "$applied" == "1" ]]; then
    echo "SKIP: $name"
    continue
  fi
  echo "APPLY: $name"
  { printf 'BEGIN;\n'; cat "$file"; printf '\nINSERT INTO schema_migrations(name) VALUES (\047%s\047);\nCOMMIT;\n' "$name"; } | sql
  echo "DONE: $name"
done
