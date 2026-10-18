#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
umask 077
mkdir -p "$BACKUP_DIR"
DATE="$(date -u +%Y%m%dT%H%M%SZ)"
DB="$BACKUP_DIR/smartinvite-$DATE.dump"
MEDIA="$BACKUP_DIR/uploads-$DATE.tar.gz"
trap 'rm -f "$DB.partial" "$MEDIA.partial"' EXIT

echo "Backing up PostgreSQL..."
docker compose exec -T db pg_dump -U postgres -d smartinvite -Fc --no-owner --no-acl > "$DB.partial"
test -s "$DB.partial"
mv "$DB.partial" "$DB"

echo "Backing up uploaded media..."
tar -C "$ROOT" -czf "$MEDIA.partial" uploads
mv "$MEDIA.partial" "$MEDIA"
chmod 600 "$DB" "$MEDIA"
# Keep backups for 14 days locally. Copy encrypted backups offsite as well!
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'smartinvite-*.dump' -o -name 'uploads-*.tar.gz' \) -mtime +13 -delete
printf 'Backup OK:\n  %s\n  %s\n' "$DB" "$MEDIA"
