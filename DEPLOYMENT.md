# Deployment Guide — VetRx Scan

Ubuntu EC2 server, Docker.

---

## First-Time Setup

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone the repo

```bash
git clone <your-repo-url> ~/doglicious-freelance
cd ~/doglicious-freelance
```

### 3. Configure environment variables

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
SERVER_URL=http://52.63.49.59
FRONTEND_URL=http://52.63.49.59/vetrxscan
```

### 4. Start the containers

```bash
docker compose up -d --build
```

### 5. Verify

```bash
docker compose ps
curl http://localhost:5000/api/health
curl http://localhost:80
```

---

## Deploying Updates

Every time you push new code:

```bash
git pull
docker compose down
docker compose up -d --build
```

Check logs if something looks off:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Useful Commands

```bash
# Status
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
```

---

## Environment Files

| File | Purpose |
|------|---------|
| `server/.env.backend` | API keys, SMTP, PayU, AI provider |
| `.env.frontend` | `VITE_API_URL` (leave empty for single-server setup) |

Never commit these files. They are in `.gitignore`.
