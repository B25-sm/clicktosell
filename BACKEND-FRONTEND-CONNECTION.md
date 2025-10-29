# Backend & Frontend Connection Setup

This guide explains how the backend and frontend are connected in the OLX Classifieds application.

## 🚀 Quick Start

### 1. Setup Connection
```bash
# Run the setup script to create environment files
npm run setup
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install-all
```

### 3. Test Connection
```bash
# Test if backend and frontend can communicate
npm run test:connection
```

### 4. Start Development
```bash
# Start both backend and frontend
npm run dev

# Or start them separately
npm run dev:backend    # Backend only
npm run dev:frontend   # Frontend only
```

## 🔧 Configuration

### Backend Configuration
- **Port**: 5000
- **Environment File**: `backend/.env`
- **CORS**: Configured to allow frontend connections
- **API Base URL**: `http://localhost:5000`

### Frontend Configuration
- **Port**: 3000
- **Environment File**: `frontend-web/.env.local`
- **API URL**: `http://localhost:5000`
- **Next.js Config**: Configured with API rewrites

## 📡 API Endpoints

### Health Checks
- `GET /health` - Backend server health
- `GET /api/health` - API health check

### Listings
- `GET /api/v1/listings` - Get all listings (with pagination, filtering)
- `GET /api/v1/listings/:id` - Get single listing
- `POST /api/v1/listings` - Create new listing
- `PUT /api/v1/listings/:id` - Update listing
- `DELETE /api/v1/listings/:id` - Delete listing

### Categories
- `GET /api/v1/categories` - Get all categories

### Search
- `GET /api/v1/search` - Search listings with filters

## 🔗 Connection Flow

```
Frontend (Next.js) ←→ Backend (Express.js)
     ↓                      ↓
  Port 3000              Port 5000
     ↓                      ↓
  .env.local            .env
     ↓                      ↓
  API Service          CORS + Routes
     ↓                      ↓
  useApi Hook          Mock Data
```

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Setup connection configuration |
| `npm run dev` | Start both backend and frontend |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run test:connection` | Test backend-frontend connection |
| `npm run install-all` | Install all dependencies |

## 🔍 Testing Connection

### Manual Testing
1. **Backend Health**: Visit `http://localhost:5000/health`
2. **API Health**: Visit `http://localhost:5000/api/health`
3. **Listings API**: Visit `http://localhost:5000/api/v1/listings`
4. **Frontend**: Visit `http://localhost:3000`

### Automated Testing
```bash
# Run connection test
npm run test:connection
```

Expected output:
```
🔍 Testing Backend & Frontend Connection...

📡 Testing Backend Server...
✅ Backend Server: OK

🔌 Testing API Endpoint...
✅ API Endpoint: OK

📋 Testing Listings API...
✅ Listings API: OK
   Found 5 listings

📂 Testing Categories API...
✅ Categories API: OK
   Found 8 categories

🌐 Testing Frontend Server...
✅ Frontend Server: OK

🎉 Connection test completed successfully!
```

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is available
netstat -an | findstr :5000

# Start backend manually
cd backend
npm run dev
```

### Frontend Not Starting
```bash
# Check if port 3000 is available
netstat -an | findstr :3000

# Start frontend manually
cd frontend-web
npm run dev
```

### CORS Issues
- Check `backend/.env` for `CORS_ORIGIN` setting
- Ensure frontend URL is in allowed origins
- Check browser console for CORS errors

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in `frontend-web/.env.local`
- Check if backend is running on correct port
- Test API endpoints directly in browser

## 📁 File Structure

```
project-root/
├── backend/
│   ├── .env                 # Backend environment variables
│   ├── fixed-server.js      # Main server file
│   └── package.json
├── frontend-web/
│   ├── .env.local          # Frontend environment variables
│   ├── src/
│   │   ├── lib/api.ts      # API service
│   │   └── hooks/useApi.ts # API hooks
│   └── package.json
├── dev-start.js            # Development startup script
├── test-connection.js      # Connection test script
└── package.json            # Root package.json
```

## 🔄 Data Flow

1. **Frontend** makes API call using `apiService`
2. **API Service** sends HTTP request to backend
3. **Backend** processes request and returns JSON response
4. **Frontend** receives response and updates UI
5. **React Hooks** manage loading states and error handling

## 🎯 Next Steps

1. **Database Integration**: Connect to MongoDB for real data
2. **Authentication**: Add user login/registration
3. **File Upload**: Implement image upload functionality
4. **Real-time Features**: Add WebSocket support
5. **Production Deployment**: Deploy to cloud platforms

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Run `npm run test:connection` to diagnose issues
3. Check browser console for frontend errors
4. Check backend console for server errors

---

**Status**: ✅ Backend and Frontend are successfully connected and communicating!
