# OLX Classifieds - Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the OLX Classifieds application to production, optimized for handling **10,000+ daily users**.

## System Requirements

### Minimum Server Specifications
- **CPU**: 8 cores (2.4GHz+)
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

### Recommended Server Specifications
- **CPU**: 16 cores (3.0GHz+)
- **RAM**: 32GB
- **Storage**: 500GB NVMe SSD
- **Network**: 10Gbps connection
- **OS**: Ubuntu 22.04 LTS

## Infrastructure Setup

### 1. Database Setup

#### MongoDB Production Setup
```bash
# Install MongoDB 7.0
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Configure MongoDB for production
sudo nano /etc/mongod.conf
```

**MongoDB Production Configuration:**
```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
      journalCompressor: snappy
      directoryForIndexes: true
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 1000

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
```

#### Redis Production Setup
```bash
# Install Redis 7.2
sudo apt update
sudo apt install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
```

**Redis Production Configuration:**
```conf
# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Network
tcp-keepalive 60
timeout 300
tcp-backlog 511

# Security
requirepass your_secure_redis_password

# Performance
databases 16
```

#### Elasticsearch Production Setup
```bash
# Install Elasticsearch 8.10
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update
sudo apt install elasticsearch

# Configure Elasticsearch
sudo nano /etc/elasticsearch/elasticsearch.yml
```

**Elasticsearch Production Configuration:**
```yaml
cluster.name: olx-classifieds
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
xpack.security.enabled: false
xpack.security.enrollment.enabled: false

# Performance settings
indices.memory.index_buffer_size: 20%
indices.queries.cache.size: 10%
thread_pool.write.queue_size: 1000
thread_pool.search.queue_size: 1000
```

### 2. Application Deployment

#### Docker Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/olx-classifieds
cd /opt/olx-classifieds
```

#### Environment Configuration
```bash
# Copy production environment template
cp env-production-template .env

# Edit environment variables
nano .env
```

**Key Production Environment Variables:**
```bash
NODE_ENV=production
API_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb://username:password@localhost:27017/olx-classifieds?authSource=admin&maxPoolSize=50&minPoolSize=10
REDIS_URL=redis://:your_redis_password@localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
```

#### SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com -d admin.your-domain.com

# Update nginx configuration
sudo nano nginx/nginx.conf
```

### 3. Load Balancer Configuration

#### Nginx Load Balancer
```nginx
upstream backend {
    least_conn;
    server backend1:5000 max_fails=3 fail_timeout=30s;
    server backend2:5000 max_fails=3 fail_timeout=30s;
    server backend3:5000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

upstream frontend {
    least_conn;
    server frontend1:3000 max_fails=3 fail_timeout=30s;
    server frontend2:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}
```

### 4. Monitoring Setup

#### Application Monitoring
```bash
# Install New Relic
npm install newrelic

# Configure New Relic
cp newrelic.js.example newrelic.js
nano newrelic.js
```

#### Log Management
```bash
# Install Logrotate
sudo apt install logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/olx-classifieds
```

**Log Rotation Configuration:**
```
/opt/olx-classifieds/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend
    endscript
}
```

### 5. Backup Strategy

#### Database Backup
```bash
# Create backup script
sudo nano /opt/olx-classifieds/scripts/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --host localhost:27017 --db olx-classifieds --out $BACKUP_DIR/mongodb_$DATE

# Redis backup
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Elasticsearch backup
curl -X PUT "localhost:9200/_snapshot/backup/snapshot_$DATE?wait_for_completion=true"

# Compress and upload to S3
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE $BACKUP_DIR/redis_$DATE.rdb
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-backup-bucket/

# Cleanup old backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

#### Automated Backup
```bash
# Add to crontab
sudo crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /opt/olx-classifieds/scripts/backup.sh
```

### 6. Performance Optimization

#### System Optimization
```bash
# Increase file descriptor limits
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# Optimize kernel parameters
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65535" >> /etc/sysctl.conf
echo "vm.swappiness = 10" >> /etc/sysctl.conf
sysctl -p
```

#### Application Optimization
```bash
# Enable PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

**PM2 Configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'olx-backend',
    script: 'backend/simple-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048'
  }]
};
```

### 7. Security Hardening

#### Firewall Configuration
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### SSL/TLS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### 8. Deployment Commands

#### Initial Deployment
```bash
# Clone repository
git clone https://github.com/your-repo/olx-classifieds.git /opt/olx-classifieds
cd /opt/olx-classifieds

# Set up environment
cp env-production-template .env
nano .env

# Build and start services
docker-compose up -d --build

# Check service status
docker-compose ps
docker-compose logs -f
```

#### Updates and Maintenance
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build

# Database migrations (if needed)
docker-compose exec backend npm run migrate

# Clear caches
docker-compose exec redis redis-cli FLUSHALL
```

### 9. Health Checks

#### Application Health Monitoring
```bash
# Create health check script
nano /opt/olx-classifieds/scripts/health-check.sh
```

**Health Check Script:**
```bash
#!/bin/bash

# Check API health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.your-domain.com/health)
if [ $API_STATUS -ne 200 ]; then
    echo "API is down! Status: $API_STATUS"
    exit 1
fi

# Check database connection
DB_STATUS=$(docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet)
if [ $? -ne 0 ]; then
    echo "Database is down!"
    exit 1
fi

# Check Redis connection
REDIS_STATUS=$(docker-compose exec -T redis redis-cli ping)
if [ "$REDIS_STATUS" != "PONG" ]; then
    echo "Redis is down!"
    exit 1
fi

echo "All services are healthy!"
```

### 10. Scaling Considerations

#### Horizontal Scaling
- Use multiple backend instances behind a load balancer
- Implement database sharding for MongoDB
- Use Redis Cluster for high availability
- Deploy multiple Elasticsearch nodes

#### Vertical Scaling
- Monitor CPU and memory usage
- Scale up server resources as needed
- Optimize database queries and indexes
- Implement caching strategies

### 11. Troubleshooting

#### Common Issues
1. **High Memory Usage**: Check for memory leaks, optimize queries
2. **Slow Response Times**: Check database performance, optimize indexes
3. **Connection Timeouts**: Increase connection pool sizes
4. **Disk Space**: Implement log rotation and cleanup

#### Monitoring Commands
```bash
# Check system resources
htop
df -h
free -h

# Check Docker resources
docker stats

# Check application logs
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## Performance Benchmarks

### Expected Performance (10k daily users)
- **Response Time**: < 200ms (95th percentile)
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9%
- **Concurrent Users**: 500+

### Monitoring Metrics
- Response time percentiles
- Error rates
- Database query performance
- Cache hit rates
- Memory and CPU usage
- Disk I/O

## Support and Maintenance

### Regular Maintenance Tasks
- Weekly security updates
- Monthly performance reviews
- Quarterly capacity planning
- Annual disaster recovery testing

### Emergency Procedures
- Service restart procedures
- Database recovery steps
- Rollback procedures
- Incident response plan

---

**Note**: This guide assumes you have basic knowledge of Linux system administration, Docker, and web application deployment. Always test in a staging environment before deploying to production.
