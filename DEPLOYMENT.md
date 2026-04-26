# Docker Deployment Guide for VetRx Scan

This guide will help you deploy the VetRx Scan full-stack application on an Ubuntu server using Docker.

## Prerequisites

- Ubuntu server (20.04 LTS or later recommended)
- Root or sudo access
- Domain name (optional, but recommended for production)

## Step 1: Install Docker and Docker Compose

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

## Step 2: Prepare Your Server

```bash
# Create application directory
mkdir -p ~/vetrxscan
cd ~/vetrxscan

# Clone or upload your application files here
# If using git:
# git clone <your-repo-url> .
```

## Step 3: Configure Environment Variables

### Backend Configuration

```bash
# Copy the example file
cp backend.env.example server/.env.backend

# Edit with your actual values
nano server/.env.backend
```

**Required environment variables:**
- `KYLAS_API_KEY` - Your Kylas CRM API key
- `GMAIL_USER` - Gmail address for sending OTP emails
- `GMAIL_APP_PASSWORD` - Gmail app password
- `OTP_SECRET` - Random secret string for OTP signing
- `CLUADE_API_KEY` or `GEMINI_API_KEY` - AI provider API key
- `PAYU_KEY` - PayU merchant key
- `PAYU_SALT` - PayU merchant salt
- `PAYU_ENV` - Set to `production` for live payments
- `SERVER_URL` - Your backend URL (e.g., `http://your-domain.com` or `http://your-ip`)
- `FRONTEND_URL` - Your frontend URL (e.g., `http://your-domain.com/vetrxscan`)

### Frontend Configuration

```bash
# Copy the example file
cp frontend.env.example .env.frontend

# Edit with your backend URL
nano .env.frontend
```

Set `VITE_API_URL` to empty (nginx will proxy) or your backend URL if separate:
```
VITE_API_URL=
```

## Step 4: Build and Run with Docker Compose

```bash
# Build the images
docker compose build

# Start the services
docker compose up -d

# Check if containers are running
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Step 5: Verify Deployment

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:80

# Or open in browser
# http://your-server-ip
```

## Step 6: Configure Firewall (Optional but Recommended)

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp

# Allow HTTPS traffic (if using SSL)
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 7: Set Up SSL with Let's Encrypt (Recommended for Production)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Stop the frontend container temporarily

```bash
docker compose stop frontend
```

### Get SSL certificate

```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### Update nginx configuration

Create `nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /usr/share/nginx/html;
    index index.html;

    # API proxy to backend
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location = /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        try_files $uri =404;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location ~* \.html$ {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
}
```

### Update docker-compose.yml to mount SSL certificates

```yaml
  frontend:
    # ... existing config ...
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
```

### Rebuild and restart

```bash
docker compose down
docker compose up -d --build
```

## Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose stop

# Start services
docker compose start

# Rebuild and restart
docker compose up -d --build

# Remove containers and volumes
docker compose down -v

# Execute command in container
docker compose exec backend sh
docker compose exec frontend sh

# View resource usage
docker stats
```

## Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Or for zero-downtime updates:
docker compose build
docker compose up -d --no-deps --build backend
docker compose up -d --no-deps --build frontend
```

## Troubleshooting

### Check container logs
```bash
docker compose logs backend
docker compose logs frontend
```

### Check if containers are running
```bash
docker compose ps
```

### Restart a specific service
```bash
docker compose restart backend
```

### Check backend health
```bash
docker compose exec backend wget -qO- http://localhost:5000/api/health
```

### Access container shell
```bash
docker compose exec backend sh
docker compose exec frontend sh
```

### Check environment variables
```bash
docker compose exec backend env
```

### View nginx configuration
```bash
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

## Backup and Restore

### Backup environment files
```bash
tar -czf vetrxscan-backup-$(date +%Y%m%d).tar.gz server/.env.backend .env.frontend
```

### Backup Docker volumes (if any)
```bash
docker compose down
sudo tar -czf volumes-backup-$(date +%Y%m%d).tar.gz /var/lib/docker/volumes/
docker compose up -d
```

## Monitoring

### Set up log rotation
Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
docker compose up -d
```

## Security Best Practices

1. **Never commit `.env` files** - Keep them only on the server
2. **Use strong secrets** - Generate random strings for `OTP_SECRET`
3. **Keep Docker updated** - Regularly update Docker and images
4. **Use SSL/TLS** - Always use HTTPS in production
5. **Limit exposed ports** - Only expose necessary ports
6. **Regular backups** - Backup environment files and data
7. **Monitor logs** - Regularly check application logs
8. **Update dependencies** - Keep npm packages updated

## Production Checklist

- [ ] Environment variables configured correctly
- [ ] `PAYU_ENV` set to `production`
- [ ] SSL certificate installed and configured
- [ ] Firewall configured
- [ ] Domain DNS configured
- [ ] `SERVER_URL` and `FRONTEND_URL` set to production URLs
- [ ] Email credentials working
- [ ] Payment gateway tested
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Log rotation configured

## Support

For issues or questions, check:
- Container logs: `docker compose logs`
- Backend health: `http://your-domain/api/health`
- Nginx configuration: `docker compose exec frontend cat /etc/nginx/conf.d/default.conf`
