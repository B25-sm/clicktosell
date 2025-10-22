# OLX Classifieds - Complete Environment Configuration
# Copy this to .env file and update with your actual values

# ===========================================
# SERVER CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=5000
API_VERSION=v1
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
MONGODB_URI=mongodb://localhost:27017/olx-classifieds
REDIS_URL=redis://localhost:6379

# ===========================================
# JWT SECRETS (Generated - Keep Secure!)
# ===========================================
JWT_SECRET=9de1b20623ed27d0274b933962097cafb4f59ead44fc721b238271eef14d960a3ab795bcdf5d8a6a92500d2845355c
JWT_REFRESH_SECRET=ba27f7f3a5ef61e7ea572661964f4d36b91a5769ed477e0e01b47802dd07ebfe12c4b987cebd45c6db079c1281126c353443ab167f8a593b42ccd02b870ebc82
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=OLX Classifieds

# SendGrid Configuration (Alternative)
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key

# ===========================================
# PAYMENT GATEWAY (RAZORPAY)
# ===========================================
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# ===========================================
# AWS S3 FILE STORAGE
# ===========================================
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# ===========================================
# SMS SERVICE (TWILIO)
# ===========================================
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================================
# GOOGLE SERVICES
# ===========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-maps-api-key

# ===========================================
# FIREBASE PUSH NOTIFICATIONS
# ===========================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# CORS CONFIGURATION
# ===========================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=info
LOG_FILE=logs/app.log

# ===========================================
# EXTERNAL SERVICES
# ===========================================
ELASTICSEARCH_URL=http://localhost:9200

# ===========================================
# PRODUCTION CONFIGURATION
# ===========================================
# Uncomment and configure for production
# NODE_ENV=production
# PORT=5000
# MONGODB_URI=mongodb://admin:password@mongodb:27017/olx-classifieds?authSource=admin
# REDIS_URL=redis://:redis123@redis:6379
# API_URL=https://your-api-domain.com
# FRONTEND_URL=https://your-frontend-domain.com

# ===========================================
# SETUP INSTRUCTIONS
# ===========================================
# 1. Copy this file to .env in your project root
# 2. Update all placeholder values with your actual credentials
# 3. For Gmail: Enable 2FA and create App Password
# 4. For Razorpay: Sign up at dashboard.razorpay.com
# 5. For AWS: Create S3 bucket and IAM user
# 6. For Twilio: Sign up at twilio.com
# 7. For Google: Create project in Google Cloud Console
# 8. For Firebase: Create project in Firebase Console
# 9. Test all services with: node test-all-services.js

