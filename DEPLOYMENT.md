# Deployment Guide — VetRx Scan

Ubuntu EC2 · Docker on port 8080 · Host Nginx reverse proxy · Let's Encrypt SSL

---

## Architecture

```
Internet (80/443)
      │
  Host Nginx          ← installed directly on Ubuntu, runs certbot
      │ proxy_pass
  localhost:8080
      │
  Docker: frontend    ← nginx inside container, port 80 internally
      │ (Docker network)
  Docker: backend     ← Node.js, port 5000 internally (not exposed to host)
```

The Docker frontend container is bound to `127.0.0.1:8080` only, so it is
never directly reachable from the internet — all traffic goes through the
host Nginx which handles TLS termination.

---

## First-Time Setup

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Install Nginx on the host

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4. Clone the repo

```bash
git clone <your-repo-url> ~/vetrxscan
cd ~/vetrxscan
```

### 5. Configure environment variables

```bash
# Backend
cp backend.env.example server/.env.backend
nano server/.env.backend

# Frontend
cp frontend.env.example .env.frontend
# VITE_API_URL can stay empty — nginx proxies /api/* to the backend
```

Key values to set in `server/.env.backend`:

```
SERVER_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 6. Start the Docker containers

```bash
docker compose up -d --build
```

Verify the containers are up and the frontend is reachable on 8080:

```bash
docker compose ps
curl http://127.0.0.1:8080          # should return HTML
curl http://127.0.0.1:8080/api/health  # should return {"status":"ok"}
```

### 7. Configure host Nginx

```bash
# Copy the provided config and replace the placeholder domain
sudo cp nginx-host.conf /etc/nginx/sites-available/doglicious
sudo nano /etc/nginx/sites-available/doglicious
# → replace every occurrence of "doglicious.in" with your real domain (if different)

# Enable the site
sudo ln -s /etc/nginx/sites-available/doglicious /etc/nginx/sites-enabled/doglicious

# Remove the default site if it's still enabled
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Obtain SSL certificate with Certbot

```bash
sudo certbot --nginx -d doglicious.in -d www.doglicious.in
```

Certbot will:
- Verify domain ownership via HTTP challenge
- Write the certificate paths into your Nginx config
- Set up automatic renewal (via systemd timer or cron)

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Deploying Updates

```bash
cd ~/vetrxscan
git pull
docker compose down
docker compose up -d --build
```

No Nginx restart needed — the host Nginx config doesn't change between app deploys.

Check logs if something looks off:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Useful Commands

```bash
# Container status
docker compose ps

# Restart without rebuild
docker compose restart

# Stop everything
docker compose down

# Live logs
docker compose logs -f

# Shell into a container
docker compose exec backend sh
docker compose exec frontend sh

# Check host Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check certificate expiry
sudo certbot certificates
```

---

## Environment Files

| File | Purpose |
|------|---------|
| `server/.env.backend` | API keys, SMTP, PayU, AI provider |
| `.env.frontend` | `VITE_API_URL` (leave empty for single-server setup) |

Never commit these files. They are in `.gitignore`.

---

## Port Reference

| Port | Where | What |
|------|-------|------|
| 80 | Host | HTTP → redirects to HTTPS (host Nginx) |
| 443 | Host | HTTPS, TLS terminated (host Nginx) |
| 8080 | Host loopback | Docker frontend container (not public) |
| 5000 | Docker network only | Backend API (not exposed to host) |
