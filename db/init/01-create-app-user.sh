#!/bin/sh
set -eu
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"
# This is executed only once when the PostgreSQL volume is empty.
psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v "app_password=$APP_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE smartinvite WITH LOGIN PASSWORD %L CONNECTION LIMIT 10', :'app_password') \gexec
GRANT CONNECT ON DATABASE smartinvite TO smartinvite;
GRANT USAGE, CREATE ON SCHEMA public TO smartinvite;
SQL
