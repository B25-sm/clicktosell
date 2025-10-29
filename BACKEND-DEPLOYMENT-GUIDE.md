# OLX Classifieds Backend - Deployment Guide

## 🚀 Backend Deployment Status

### ✅ **Issues Fixed:**
1. **Fixed `backend/models/index.js`** - Removed incorrect Express middleware code
2. **Created `backend/vercel.json`** - Proper Vercel configuration for Node.js API
3. **Verified package.json** - All dependencies and scripts are correct
4. **Tested server files** - Both `simple-server.js` and `working-server.js` are functional

### 🔧 **Backend Configuration:**

#### **Main Server Files:**
- ✅ `simple-server.js` - Production-ready server with Sentry, rate limiting, and optimization
- ✅ `working-server.js` - Alternative server with basic functionality
- ✅ `server.js` - Full-featured server (if needed)

#### **Package.json Scripts:**
```json
{
  "start": "node simple-server.js",
  "dev": "nodemon simple-server.js",
  "test": "jest"
}
```

## 🌐 **Deploy Backend to Vercel**

### **Option 1: Deploy via Vercel Dashboard**

1. **Go to [vercel.com](https://vercel.com)**
2. **Create New Project**
3. **Import from GitHub** - Select your repository
4. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

### **Option 2: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: olx-classifieds-backend
# - Directory: ./
# - Override settings? No
```

## 🔧 **Environment Variables for Backend**

Add these in Vercel Dashboard → Project Settings → Environment Variables:

### **Required Variables:**
```bash
NODE_ENV=production
PORT=5000
```

### **Optional Variables (for full functionality):**
```bash
# Database
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-string

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Other Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📊 **Backend API Endpoints**

### **Health Checks:**
- `GET /health` - Server health status
- `GET /api/health` - API health check

### **Sample Endpoints:**
- `GET /api/v1/listings` - Get sample listings
- `POST /api/v1/email/test-config` - Test email configuration
- `POST /api/v1/payments/test/connection` - Test payment configuration

### **Example API Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "1",
        "title": "iPhone 13 Pro",
        "price": 50000,
        "location": "Mumbai",
        "image": "https://via.placeholder.com/300x200",
        "category": "Electronics"
      }
    ],
    "total": 1
  }
}
```

## 🔄 **Update Frontend API URL**

After deploying the backend, update your frontend environment variables:

### **In Vercel Dashboard → Frontend Project → Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
```

### **Or in `frontend-web/.env.local`:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
```

## 🧪 **Test Backend Deployment**

### **1. Health Check:**
```bash
curl https://your-backend-api.vercel.app/health
```

### **2. API Test:**
```bash
curl https://your-backend-api.vercel.app/api/v1/listings
```

### **3. Frontend Integration:**
Update your frontend to use the new API URL and test all functionality.

## 🚀 **Full Stack Deployment**

### **Deployment Order:**
1. ✅ **Backend API** → Deploy to Vercel
2. ✅ **Frontend Web** → Deploy to Vercel  
3. ✅ **Update API URL** → Point frontend to backend
4. ✅ **Test Integration** → Verify full functionality

### **Final URLs:**
- **Frontend:** `https://your-frontend.vercel.app`
- **Backend API:** `https://your-backend-api.vercel.app`
- **Health Check:** `https://your-backend-api.vercel.app/health`

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   ```bash
   # Check Node.js version (requires 16+)
   # Verify all dependencies in package.json
   ```

2. **Environment Variables Not Working:**
   ```bash
   # Restart deployment after adding variables
   # Check variable names match exactly
   ```

3. **CORS Issues:**
   ```bash
   # Update CORS origin in simple-server.js
   # Add your frontend domain to allowed origins
   ```

4. **Database Connection Issues:**
   ```bash
   # Use MongoDB Atlas for production
   # Update MONGODB_URI with production connection string
   ```

## 📈 **Performance Optimization**

### **Production Features:**
- ✅ **Rate Limiting** - 1000 requests per 15 minutes
- ✅ **Compression** - Gzip compression enabled
- ✅ **Security Headers** - Helmet.js protection
- ✅ **Error Tracking** - Sentry integration
- ✅ **Logging** - Morgan request logging
- ✅ **Health Checks** - Monitoring endpoints

### **Scaling Considerations:**
- Use MongoDB Atlas for database
- Implement Redis for caching
- Add load balancing for high traffic
- Monitor performance with Vercel Analytics

## 🎉 **Success!**

Your backend is now ready for production deployment!

**Next Steps:**
1. Deploy backend to Vercel
2. Update frontend API URL
3. Test full integration
4. Monitor performance
5. Add real database connections

**Backend Features:**
- 🚀 **Fast API** with Express.js
- 🔒 **Secure** with rate limiting and CORS
- 📊 **Monitored** with health checks
- 🛡️ **Protected** with security headers
- ⚡ **Optimized** for production performance




