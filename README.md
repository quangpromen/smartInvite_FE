> **Tài liệu nghiệp vụ/FE mới (v2, 16/10/2026):** Đọc [`START_HERE_V2.md`](START_HERE_V2.md), [`CODEX_PLAN.md`](CODEX_PLAN.md), [`EVENT_CARD_GUEST_LOGIC.md`](EVENT_CARD_GUEST_LOGIC.md), [`FE_SCREEN_SPEC.md`](FE_SCREEN_SPEC.md) và [`ANTIGRAVITY_NEXT_TASK.md`](ANTIGRAVITY_NEXT_TASK.md).

## Frontend Architecture — Phase 1A (Event-first & Multi-card Foundation)

Ứng dụng chính đã được chuyển đổi hoàn toàn sang **Next.js App Router + React + TypeScript strict** (không còn redirect sang prototype HTML cũ):
- **Landing Page**: `/`
- **Mock Login**: `/login`
- **Dashboard Overview**: `/dashboard`
- **Events Management**: `/dashboard/events`, `/dashboard/events/new`
- **Event Workspace**: `/dashboard/events/[eventId]`, `/dashboard/events/[eventId]/settings`
- **Card Gallery & Create**: `/dashboard/events/[eventId]/cards`, `/dashboard/events/[eventId]/cards/new`
- **Global Card Chooser**: `/dashboard/cards/new` (bắt buộc chọn sự kiện)
- **Admin System Aggregates**: `/admin`

### Kiểm thử và chạy ứng dụng
```bash
npm run dev        # Khởi chạy dev server tại http://localhost:3000
npm run typecheck  # Kiểm tra toàn bộ TypeScript (strict mode)
npm run test       # Chạy 14 business invariant test cases (scripts/test-phase1a.ts)
npm run build      # Build bản production Next.js
```
*Lưu ý:* Mọi thao tác và dữ liệu ở Phase 1A được xử lý qua Mock Repository có persistence `localStorage` (`smartinvite.ui.v2`), chưa kết nối database hay server backend.

# SmartInvite — VPS production deployment starter

This is a **deployment and database starter**, **not a finished invitation application**.
The UI provides only a landing page and `/api/health`. `sharp` is included for future `next/image` optimization. No signup, RSVP, check-in,
invitation editor, authorization or safe media upload endpoints are implemented yet.
Do not publish `/dashboard` or `/admin` without implementing server-side auth and RBAC.

## Target VPS

- Ubuntu Desktop 22.04/24.04 LTS, 1 vCPU, 2 GB RAM, ideally >=25 GB available disk.
- Docker Engine with Docker Compose plugin.
- Real public IPv4, DNS A record, inbound ports 80/443 TCP open, SSH accessible.
- No build on VPS. Build from Linux/Windows Docker Desktop on a stronger computer.

## Files

- `compose.yml`: Next.js + PostgreSQL 17 + Caddy, private DB networking.
- `Caddyfile`: automatic HTTPS, reverse proxy, header and body-size safeguards.
- `Dockerfile`: multi-stage Next standalone build, non-root runtime.
- `db/init/01-create-app-user.sh`: least-privilege application DB account.
- `db/migrations/001_init.sql`: event / invitation / RSVP / check-in schema.
- `scripts/migrate.sh`: idempotent, tracked SQL migrations.
- `scripts/backup.sh`, `scripts/restore.sh`: PostgreSQL + uploads backup and restore.
- `scripts/deploy-server.sh`: database backup + migrations + app health + image rollback.
- `scripts/validate-config.sh`: validate Compose and Caddy syntax on a Docker host.

## 1. Prepare VPS

Keep a cloud-console or provider-console session available while changing SSH/firewall.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw openssl cron
free -h && df -h && uname -m
```

If no swap exists and disk space allows, add 2 GiB swap:

```bash
swapon --show
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
printf '/swapfile none swap sw 0 0\n' | sudo tee -a /etc/fstab
```

If swap already exists, skip the creation commands.
Ubuntu Desktop is memory-heavy. If you do not need GUI, `sudo systemctl set-default multi-user.target && sudo reboot` disables graphical boot. Restore with `sudo systemctl set-default graphical.target && sudo reboot`.

### Firewall

Verify the SSH port (`sudo ss -tlnp | grep sshd`) and provider firewall, then:

```bash
sudo ufw allow 22/tcp  # Replace 22 if SSH uses another port.
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Docker published ports can bypass UFW. Only Caddy ports are published in Compose.
The host SSH port should ideally be limited to your IP using the provider firewall.
**Never publish DB port 5432 or app port 3000.**

### Docker Engine (official apt repository)

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF_DOCKER
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF_DOCKER
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker compose version
```

For convenience, you may add an SSH deployment user to `docker` group, but this grants root-equivalent access. More restrictive alternatives involve a root-owned deploy process. If using docker group:

```bash
sudo usermod -aG docker "$USER"
# logout and SSH back in, then:
docker info >/dev/null
```

Do not disable SSH password login until key authentication is confirmed from a *second SSH session*. Use SSH keys, `PermitRootLogin no`, `PasswordAuthentication no`, then `sudo sshd -t && sudo systemctl reload ssh`.

## 2. DNS

Create A record e.g. `invite.example.com` -> `YOUR_VPS_PUBLIC_IP`. Only add an AAAA record if IPv6 is correctly configured. On Ubuntu VPS, check `dig +short invite.example.com` or `getent ahostsv4 invite.example.com`. Caddy requires domain validation over public ports 80/443.

## 3. Prepare application and secrets (on laptop)

```bash
npm install
npm run typecheck
npm audit --omit=dev
```

`npm install` generates **package-lock.json**, required by Dockerfile's `npm ci`. Review npm security warnings and upgrade Next.js/React if newer patched versions exist; commit your lockfile to Git. Starter package versions are lower bounds, not guaranteed newest by deployment day.

For optional local application test, use an appropriate local `.env.local` pointing to a dev database rather than public production credentials. Do not commit secrets.

On VPS, put the deployment directory at `/opt/smartinvite`. Copy these files via `scp`, `rsync` or a private git repository, *excluding your node_modules and local `.env.local`*:

```bash
sudo mkdir -p /opt/smartinvite
sudo chown "$USER":"$USER" /opt/smartinvite
cd /opt/smartinvite
cp .env.example .env
chmod 600 .env
mkdir -p uploads backups
chmod 700 backups
sudo chown 1000:"$(id -g)" uploads
sudo chmod 2770 uploads  # node UID 1000 writes; deployment user group can back up
```

Edit `/opt/smartinvite/.env` with a text editor. Replace values as follows:

- `DOMAIN`: your DNS name.
- `APP_IMAGE`: first image tag (must match loaded Docker image).
- `PG_SUPER_PASSWORD`: unique value from `openssl rand -hex 24`.
- `APP_DB_PASSWORD`: another unique value from `openssl rand -hex 24`.
- `AUTH_SECRET`: unique value from `openssl rand -hex 32`.

For security, generate **three separate secrets** and **never copy actual `.env` into Git**. Use long hex values so DB URI interpolation remains valid. The auth secret is reserved for auth integration; this starter does *not* provide auth.

```bash
bash scripts/validate-config.sh
```

**Database init script runs only once, on an empty named volume.** If you change APP_DB_PASSWORD later, changing `.env` alone will NOT rotate the existing database role password; use `ALTER ROLE` securely as well.

## 4. Build image on local machine, transfer it

Example for an x86_64 VPS (`uname -m` -> `x86_64`):

```bash
# Laptop (Linux/macOS terminal, or Docker Desktop shell)
docker build --platform linux/amd64 -t smartinvite:20261016-01 .
docker save -o smartinvite-image.tar smartinvite:20261016-01
scp smartinvite-image.tar YOUR_SSH_USER@YOUR_VPS_IP:/tmp/smartinvite-image.tar

# VPS
sudo docker load -i /tmp/smartinvite-image.tar
sudo rm -f /tmp/smartinvite-image.tar
cd /opt/smartinvite
bash scripts/deploy-server.sh smartinvite:20261016-01
```

Windows PowerShell supports `docker build`, `docker save`, `scp` with similar syntax. For ARM VPS use `linux/arm64` instead. `docker load` outputs the imported image name.

`deploy-server.sh` starts the DB, makes a backup, applies new SQL migrations, starts the app, verifies `/api/health`, and launches Caddy. It restores the previous **app image** if the new app fails health check (when an older local image exists). It never undoes schema migrations automatically.

For first boot, HTTPS issuance may take a short time after container startup. Check:

```bash
docker compose ps
docker compose logs --tail=80 app
docker compose logs --tail=80 caddy
curl -I https://YOUR_REAL_DOMAIN
curl -fsS https://YOUR_REAL_DOMAIN/api/health
```

Expected health body: `{"status":"ok"}`. The `/` page explains that this is the infrastructure starter.

## 5. Deploy an update

1. Commit/test source. Review security patches and `npm audit`.
2. **Build a new image on your laptop**, choose a new immutable release tag.
3. `docker save`, `scp`, `docker load` as above.
4. Transfer any changed `db/migrations/*.sql`, `compose.yml`, and scripts to VPS before deploy.
5. Run `bash scripts/deploy-server.sh smartinvite:NEW_TAG` on VPS.
6. Check `docker compose ps`, logs, and real guest workflows.

Write **backwards-compatible database migrations** whenever possible. Before destructive changes, take a backup and plan downtime. To roll back *app only* (if old image is still present):

```bash
bash scripts/deploy-server.sh smartinvite:OLD_TAG
```

This takes another backup and runs migrations; no automatic schema rollback.

## 6. Automatic backups and recovery

Test manually:

```bash
cd /opt/smartinvite
bash scripts/backup.sh
ls -lh backups/
```

Schedule as the deployment user (make sure `cron` is running):

```bash
sudo systemctl enable --now cron
crontab -e
# Add one line, replacing USERNAME with actual VPS user:
# 15 3 * * * /usr/bin/bash /opt/smartinvite/scripts/backup.sh >> /home/USERNAME/smartinvite-backup.log 2>&1
```

Backups are stored in `backups/` on the VPS with 14-day local retention. **Same-server backups are NOT disaster recovery.** Securely copy both `.dump` and `.tar.gz` files to another machine/storage, encrypted at rest, and test restoration routinely. Images stored in external volume must also be backed up.

Restore is DESTRUCTIVE; first take an extra backup, stop any external writers, and read the script:

```bash
cd /opt/smartinvite
RESTORE_CONFIRM=YES bash scripts/restore.sh \
  backups/smartinvite-YYYYMMDDTHHMMSSZ.dump \
  backups/uploads-YYYYMMDDTHHMMSSZ.tar.gz
```

The script stops the app, recreates the DB, loads the dump, restores the media archive, then starts the app. Restore should first be rehearsed on a disposable test VPS. The application is unavailable during restore.

## 7. Monitoring / operations

```bash
docker compose ps
docker compose logs -f --tail=100 app
free -h && swapon --show
df -h
docker stats --no-stream
sudo journalctl -u docker --since '1 hour ago' --no-pager
```

Keep Docker, Ubuntu, Caddy, PostgreSQL, Node/Next patched. Do not automatically prune named volumes or run `docker compose down -v` on production.

## 8. BEFORE real guests and commercialization

- Add **server-side login sessions** with a proven library and Argon2id/bcrypt hashes; no default admin account.
- Protect `/dashboard`, `/admin`, all write APIs with validated session, ownership and RBAC. Merely hiding the links is not security.
- Issue cryptographically random 32-byte guest tokens; store a SHA-256 hash in the DB and compare hash on access. Treat links as bearer credentials. Allow revocation.
- CSRF protection for cookie-authenticated writes, origin checks, restrictive cookies (`Secure`, `HttpOnly`, `SameSite`), rate limiting RSVP/login/check-in endpoints.
- Enforce event membership and check-in permissions *on the server*, including in SQL queries.
- Validate user inputs (`zod` or equivalent), cap uploads, verify file type, store filenames safely, protect file URLs, enforce privacy policy and retention.
- Use UNIQUE constraints and transactions to prevent duplicate RSVP/check-in; avoid counting visits as confirmed deliveries.
- Protect backups; preferably encrypt offsite copies, store recovery secrets separately, and test restore.
- Load test on VPS before the ceremony (especially 1 vCPU / 2GB). Export an offline guest list as fallback.

### Security expectations

This starter isolates Docker services and demonstrates the deployment workflow, but it is **not yet an authenticated, production-ready invitation application**. Replace the landing page with your application and pass the checklist above before handling real guest data.

## Troubleshooting

- `504/502`: `docker compose logs app`; check DB and app container health.
- HTTPS invalid: confirm domain resolves to public VPS IP, inbound TCP 80/443, no invalid AAAA record, check `docker compose logs caddy`.
- `password authentication failed`: `.env` APP_DB_PASSWORD does not match the DB role stored in existing volume; reset securely via `ALTER ROLE` or restore from correct backup.
- App `OOMKilled`: `docker inspect` state, `docker stats`, `free -m`, remove unnecessary desktop GUI services, optimize the app or upgrade RAM.
- `npm ci` fails in Docker: create and transfer `package-lock.json` from `npm install` and keep it committed.
- Cannot use `docker`: confirm account belongs to docker group, log out/in; membership confers root-equivalent privilege.
- `psql role smartinvite does not exist`: role-init script failed on first DB initialization, inspect db logs; do not delete a volume with real data.
