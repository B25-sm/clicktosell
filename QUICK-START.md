# 🚀 Quick Start Guide - Frontend & Backend Connection

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🏃‍♂️ Quick Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install-all
```

### 2. Start Development Environment

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

### 3. Test Connection

```bash
# Test backend connection
npm run test:connection
```

### 4. Verify Everything Works

1. **Backend Health**: http://localhost:5000/health
2. **Frontend**: http://localhost:3000
3. **Connection Test**: http://localhost:3000/test

## 🔧 Manual Setup (Alternative)

If you prefer to run servers separately:

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend-web
npm run dev
```

## 🧪 Testing the Connection

### Option 1: Automated Test
```bash
npm run test:connection
```

### Option 2: Manual Test
1. Open http://localhost:3000/test
2. Click "Test Backend Connection"
3. Verify success message

### Option 3: API Direct Test
```bash
# Test backend health
curl http://localhost:5000/health

# Test API health
curl http://localhost:5000/api/health

# Test listings
curl http://localhost:5000/api/v1/listings
```

## 🎯 What You Should See

### Backend Console
```
🚀 Server running on port 5000
📊 Health check: http://localhost:5000/health
🔗 API endpoint: http://localhost:5000/api/health
📱 Listings API: http://localhost:5000/api/v1/listings
```

### Frontend Console
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

### Connection Test Results
```
✅ Backend Health: OK
✅ API Health: OK
✅ Listings API: Working
✅ CORS: Configured
```

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Kill process if needed
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Starting
```bash
# Check if port 3000 is in use
netstat -an | grep 3000

# Kill process if needed
lsof -ti:3000 | xargs kill -9
```

### Connection Issues
1. Ensure both servers are running
2. Check firewall settings
3. Verify CORS configuration
4. Check browser console for errors

## 📁 Key Files

- `start-dev.js` - Development startup script
- `test-connection.js` - Connection test script
- `frontend-web/src/lib/api.ts` - API service layer
- `frontend-web/src/hooks/useApi.ts` - React hooks
- `backend/fixed-server.js` - Backend server
- `FRONTEND-BACKEND-CONNECTION.md` - Detailed documentation

## 🎉 Success!

If everything is working, you should see:
- Backend running on port 5000
- Frontend running on port 3000
- Real data loading from backend API
- Connection test passing

## 📞 Need Help?

1. Check the detailed documentation: `FRONTEND-BACKEND-CONNECTION.md`
2. Run the connection test: `npm run test:connection`
3. Check browser console for errors
4. Verify both servers are running

Happy coding! 🚀
