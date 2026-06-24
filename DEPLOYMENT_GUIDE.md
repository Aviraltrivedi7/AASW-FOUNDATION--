# 🚀 AASW Foundation - Production Deployment Guide

Complete step-by-step guide to deploy your website to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Domain name registered (e.g., aaswfoundation.com)
- ✅ VPS/Cloud server (DigitalOcean, AWS, Linode, etc.)
- ✅ Razorpay live account with API keys
- ✅ Gmail account with App Password enabled
- ✅ SSL certificate (Let's Encrypt - free)
- ✅ All bugs fixed (see BUG_FIXES_SUMMARY.md)

---

## 🖥️ Server Setup (Ubuntu 20.04/22.04)

### Step 1: Connect to Your Server
```bash
ssh root@your-server-ip
```

### Step 2: Update System
```bash
apt update && apt upgrade -y
```

### Step 3: Install Node.js (v18 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### Step 4: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Step 5: Install Nginx (Web Server)
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Step 6: Install Certbot (SSL)
```bash
apt install -y certbot python3-certbot-nginx
```

---

## 📦 Deploy Application

### Step 1: Create Application Directory
```bash
mkdir -p /var/www/aasw-foundation
cd /var/www/aasw-foundation
```

### Step 2: Clone Repository
```bash
# Option A: Using Git
git clone https://github.com/Aviraltrivedi7/AASW-FOUNDATION-.git .

# Option B: Upload via SCP from local machine
# scp -r /path/to/local/project/* root@your-server-ip:/var/www/aasw-foundation/
```

### Step 3: Install Dependencies
```bash
npm install --production
```

### Step 4: Configure Environment Variables
```bash
nano .env
```

Update with production values:
```env
# Server
PORT=3000
NODE_ENV=production

# JWT Secret (Generate new one!)
JWT_SECRET=<run: openssl rand -hex 64>

# CORS
ALLOWED_ORIGINS=https://aaswfoundation.com,https://www.aaswfoundation.com

# SMTP Email
CONTACT_EMAIL=aaswfoundation06@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=aaswfoundation06@gmail.com
SMTP_PASS=<your-gmail-app-password>
SMTP_FROM=aaswfoundation06@gmail.com

# Razorpay LIVE Keys (Important!)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=<your-live-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>

# InsForge (if using)
INSFORGE_URL=https://your-app.region.insforge.app
INSFORGE_KEY=<your-insforge-key>
```

**Important:** Generate new JWT secret:
```bash
openssl rand -hex 64
```

### Step 5: Set Proper Permissions
```bash
chown -R www-data:www-data /var/www/aasw-foundation
chmod -R 755 /var/www/aasw-foundation
```

---

## 🔧 Configure Nginx

### Step 1: Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/aasw-foundation
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name aaswfoundation.com www.aaswfoundation.com;

    # Redirect HTTP to HTTPS (will be enabled after SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### Step 2: Enable Site
```bash
ln -s /etc/nginx/sites-available/aasw-foundation /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

---

## 🔒 Setup SSL Certificate (HTTPS)

### Step 1: Obtain SSL Certificate
```bash
certbot --nginx -d aaswfoundation.com -d www.aaswfoundation.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### Step 2: Auto-Renewal Setup
```bash
certbot renew --dry-run  # Test renewal
```

Certbot automatically sets up a cron job for renewal.

---

## 🚀 Start Application with PM2

### Step 1: Start Application
```bash
cd /var/www/aasw-foundation
pm2 start server.js --name aasw-foundation -i max
```

Options explained:
- `--name aasw-foundation` - Process name
- `-i max` - Use all CPU cores (clustering)

### Step 2: Save PM2 Configuration
```bash
pm2 save
```

### Step 3: Setup PM2 Startup Script
```bash
pm2 startup systemd
# Copy and run the command it outputs
```

### Step 4: Verify Application
```bash
pm2 status
pm2 logs aasw-foundation
```

---

## 🔍 Verify Deployment

### 1. Check Application Status
```bash
pm2 status
# Should show "online" status
```

### 2. Check Nginx Status
```bash
systemctl status nginx
# Should show "active (running)"
```

### 3. Test Website
```bash
curl http://localhost:3000
# Should return HTML
```

### 4. Test Domain
Open browser and visit:
- https://aaswfoundation.com
- https://www.aaswfoundation.com

### 5. Test Contact Form
- Fill and submit contact form
- Check email inbox for notification

### 6. Test Admin Login
- Visit: https://aaswfoundation.com/admin/login
- Login with credentials
- Verify dashboard loads

---

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# View logs
pm2 logs aasw-foundation

# Monitor resources
pm2 monit

# Restart application
pm2 restart aasw-foundation

# Stop application
pm2 stop aasw-foundation

# Delete from PM2
pm2 delete aasw-foundation
```

### Check Server Resources
```bash
# CPU and Memory
htop

# Disk space
df -h

# Network connections
netstat -tulpn | grep :3000
```

### View Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

---

## 🔄 Update Application

When you need to update the code:

```bash
cd /var/www/aasw-foundation

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install --production

# Restart application
pm2 restart aasw-foundation

# Check logs
pm2 logs aasw-foundation --lines 50
```

---

## 🛡️ Security Hardening

### 1. Setup Firewall (UFW)
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### 2. Disable Root Login
```bash
nano /etc/ssh/sshd_config
```
Change:
```
PermitRootLogin no
```
Restart SSH:
```bash
systemctl restart sshd
```

### 3. Setup Fail2Ban (Brute Force Protection)
```bash
apt install -y fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

### 4. Regular Updates
```bash
# Create update script
nano /root/update.sh
```

Add:
```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
certbot renew
pm2 update
```

Make executable:
```bash
chmod +x /root/update.sh
```

Setup cron job:
```bash
crontab -e
```
Add:
```
0 3 * * 0 /root/update.sh >> /var/log/update.log 2>&1
```

---

## 🔧 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs aasw-foundation --err

# Check if port is in use
lsof -i :3000

# Verify .env file
cat .env

# Test manually
node server.js
```

### Nginx Errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew manually
certbot renew --force-renewal

# Check Nginx SSL config
nano /etc/nginx/sites-available/aasw-foundation
```

### High Memory Usage
```bash
# Check PM2 processes
pm2 list

# Restart application
pm2 restart aasw-foundation

# Clear logs
pm2 flush
```

---

## 📈 Performance Optimization

### 1. Enable HTTP/2 in Nginx
Edit Nginx config:
```nginx
listen 443 ssl http2;
```

### 2. Setup Redis Caching (Optional)
```bash
apt install -y redis-server
systemctl start redis
systemctl enable redis
```

### 3. Database Optimization (if using)
- Enable query caching
- Add proper indexes
- Regular backups

---

## 💾 Backup Strategy

### 1. Database Backup (if using)
```bash
# Create backup script
nano /root/backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/aasw"
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/aasw-foundation

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

### 2. Setup Automated Backups
```bash
chmod +x /root/backup.sh
crontab -e
```
Add:
```
0 2 * * * /root/backup.sh
```

---

## 📞 Support Contacts

If you need help:

- **Email:** aaswfoundation06@gmail.com
- **Phone:** +91 9984156418
- **GitHub Issues:** https://github.com/Aviraltrivedi7/AASW-FOUNDATION-/issues

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] Domain DNS pointing to server IP
- [ ] SSL certificate installed and working
- [ ] Environment variables configured
- [ ] Razorpay live keys configured
- [ ] Email notifications working
- [ ] Contact form submitting
- [ ] Admin login working
- [ ] All pages loading correctly
- [ ] Mobile responsive working
- [ ] Payment gateway tested
- [ ] Firewall configured
- [ ] PM2 startup script enabled
- [ ] Nginx configured and running
- [ ] Backup script setup
- [ ] Monitoring enabled

---

<p align="center">
  <b>🎉 Congratulations! Your website is now live! 🎉</b>
</p>

---

**Last Updated:** May 3, 2026  
**Version:** 1.0.0
