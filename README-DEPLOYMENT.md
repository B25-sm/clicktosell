# OLX Classifieds - Deployment Guide

This guide provides comprehensive instructions for deploying the OLX Classifieds application in different environments.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows 10+ with WSL2 / macOS 10.15+
- **Memory**: 8GB RAM minimum (16GB recommended for production)
- **Storage**: 50GB free space minimum
- **CPU**: 4 cores minimum (8 cores recommended for production)

### Required Software
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 18.0+ (for local development)
- **Git**: 2.30+

### Domain and SSL (Production Only)
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

## 🚀 Quick Start

### Deploy frontend-web to Vercel (Fastest Path)

1) Create a Vercel project targeting the `frontend-web` directory (monorepo):

   - Framework preset: Next.js
   - Root Directory: `frontend-web`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

2) Set environment variables in Vercel → Project → Settings → Environment Variables:

   - `NEXT_PUBLIC_API_BASE_URL` → your backend URL
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` → temporary test key until live

3) Connect GitHub/GitLab repo and push. Vercel deploys `frontend-web` automatically.

4) Set production domain in Vercel → Domains. Once live, request Razorpay live keys.

5) Optional previews: Enable “Preview Deployments” for PRs.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/olx-classifieds.git
cd olx-classifieds
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 3. Deploy with Docker
```bash
# Make deploy script executable (Linux/macOS)
chmod +x scripts/deploy.sh

# Deploy all services
./scripts/deploy.sh deploy development all
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001  
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 🔧 Environment Configuration

### Required Environment Variables

#### Database Configuration
```bash
MONGODB_URI=mongodb://admin:password123@mongodb:27017/olx-classifieds?authSource=admin
REDIS_URL=redis://:redis123@redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
```

#### Security Configuration
```bash
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex
JWT_REFRESH_SECRET=your_refresh_token_secret_here
BCRYPT_ROUNDS=12
```

#### Email Configuration (Gmail Example)
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-app@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@olx-classifieds.com
```

#### SMS Configuration (Twilio)
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### File Storage (AWS S3)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=olx-classifieds-storage
```

#### Payment Gateways
```bash
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
```

## 🐳 Docker Deployment

### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment
```bash
# Deploy to production
./scripts/deploy.sh deploy production all

# Check service health
./scripts/deploy.sh logs production all

# Create database backup
./scripts/deploy.sh backup production
```

### Individual Service Management
```bash
# Deploy only backend
./scripts/deploy.sh deploy production backend

# Deploy only frontend
./scripts/deploy.sh deploy production frontend

# Deploy only admin panel
./scripts/deploy.sh deploy production admin
```

## 🔨 Manual Deployment

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure environment variables
npm run build
npm start
```

### Frontend Setup
```bash
cd frontend-web
npm install
cp .env.example .env.local
# Configure environment variables
npm run build
npm start
```

### Mobile App Setup
```bash
cd mobile-app
npm install

# For Android
npx react-native run-android

# For iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📊 Database Setup

### MongoDB Initialization
```bash
# Connect to MongoDB
docker-compose exec mongodb mongo

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application database
use olx-classifieds
db.createCollection("users")
```

### Database Seeding
```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

### Redis Configuration
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Set password
CONFIG SET requirepass redis123
AUTH redis123
```

## 🔒 Security Configuration

### SSL Certificate Setup (Production)
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/private.key
```

### Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 📈 Monitoring and Maintenance

### Health Checks
```bash
# Check service status
docker-compose ps

# Check service health
curl http://localhost:5000/health
curl http://localhost:3000
curl http://localhost:3001
```

### Log Management
```bash
# View real-time logs
docker-compose logs -f [service_name]

# View last 100 lines
docker-compose logs --tail=100 [service_name]

# Export logs
docker-compose logs > application.log
```

### Database Backup
```bash
# Create backup
./scripts/deploy.sh backup production

# Manual MongoDB backup
docker-compose exec mongodb mongodump --out /backup
docker cp $(docker-compose ps -q mongodb):/backup ./backup-$(date +%Y%m%d)
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check disk usage
df -h
du -sh ./data/*

# Monitor network connections
netstat -tulpn
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs [service_name]

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Restart services
docker-compose restart [service_name]
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check network connectivity
docker-compose exec backend ping mongodb

# Reset database
docker-compose down
docker volume rm olx-classifieds_mongodb_data
docker-compose up -d
```

#### Memory Issues
```bash
# Check memory usage
free -h
docker stats --no-stream

# Increase swap space (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/certificate.crt -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

### Performance Optimization

#### Database Optimization
```javascript
// MongoDB indexes
db.users.createIndex({ email: 1 })
db.listings.createIndex({ category: 1, location: 1 })
db.listings.createIndex({ seller: 1, status: 1 })
```

#### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 4096;
keepalive_timeout 30;
client_max_body_size 50M;
```

## 📱 Mobile App Deployment

### Android APK Build
```bash
cd mobile-app
npx react-native build-android --mode=release
```

### iOS App Store Build
```bash
cd mobile-app
npx react-native build-ios --mode=release
```

### App Store Submission
1. Configure app metadata in App Store Connect
2. Upload build using Xcode or Transporter
3. Submit for review

### Google Play Store Submission
1. Create signed APK/AAB
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && ./scripts/deploy.sh deploy production all'
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check service health and logs
- **Weekly**: Update dependencies and security patches
- **Monthly**: Database cleanup and optimization
- **Quarterly**: Security audit and performance review

### Contact Information
- **Developer**: Sai Mahendra
- **Email**: Saimahendra222@gmail.com
- **Phone**: 9063443115

### Support Included
- 15 days free bug fixes post-deployment
- 1 year support for issues in written code
- Regular updates and security patches

---

For additional support or custom deployment requirements, please contact the development team.



