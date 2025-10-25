# Frontend-Backend Connection Guide

This guide explains how the frontend and backend are connected in the OLX Classifieds application.

## 🏗️ Architecture Overview

```
Frontend (Next.js) ←→ Backend (Express.js)
     ↓                      ↓
  Port 3000            Port 5000
```

## 📁 File Structure

```
├── frontend-web/
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.ts              # API service layer
│   │   ├── hooks/
│   │   │   └── useApi.ts           # Custom React hooks
│   │   └── components/
│   │       └── ConnectionTest.tsx  # Connection testing
│   └── next.config.js              # Next.js configuration
├── backend/
│   ├── fixed-server.js             # Main server file
│   └── package.json
└── start-dev.js                    # Development startup script
```

## 🔧 Configuration

### Frontend Configuration

The frontend is configured to connect to the backend through:

1. **Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

2. **Next.js Configuration** (`next.config.js`):
```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
},
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
        : 'http://localhost:5000/api/:path*',
    },
  ];
}
```

### Backend Configuration

The backend server (`fixed-server.js`) is configured with:

1. **CORS Settings**:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

2. **API Endpoints**:
- Health check: `GET /api/health`
- Listings: `GET /api/v1/listings`

## 🚀 API Service Layer

### API Client (`src/lib/api.ts`)

The API service provides a centralized way to communicate with the backend:

```typescript
export const apiService = {
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  async getListings(params?: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    search?: string;
  }): Promise<ApiResponse<ListingsResponse>> {
    const response = await apiClient.get('/api/v1/listings', { params });
    return response.data;
  },
  // ... more methods
};
```

### Custom Hooks (`src/hooks/useApi.ts`)

React hooks for easy API integration:

```typescript
export function useListings() {
  return useApi(() => apiService.getListings());
}

export function useListing(id: string) {
  return useApi(() => apiService.getListing(id));
}
```

## 🔄 Data Flow

1. **Frontend Request**: User interacts with the UI
2. **Hook Call**: React hook calls API service
3. **API Service**: Makes HTTP request to backend
4. **Backend Processing**: Express server processes request
5. **Response**: Data flows back to frontend
6. **UI Update**: React components re-render with new data

## 🧪 Testing Connection

### Connection Test Component

The `ConnectionTest` component provides a UI to test the backend connection:

```typescript
export function ConnectionTest() {
  const testConnection = async () => {
    try {
      const healthResponse = await apiService.healthCheck();
      const listingsResponse = await apiService.getListings();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

### Test Page

Visit `/test` to access the connection test interface.

## 🚀 Development Setup

### Start Both Servers

1. **Using the startup script**:
```bash
npm run dev
```

2. **Manually**:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend-web
npm run dev
```

### Verify Connection

1. Open http://localhost:3000/test
2. Click "Test Backend Connection"
3. Verify both health check and listings API work

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend CORS includes frontend URL
   - Check that both servers are running

2. **Connection Refused**:
   - Verify backend is running on port 5000
   - Check firewall settings

3. **API Timeout**:
   - Increase timeout in `api.ts`
   - Check network connectivity

### Debug Steps

1. Check backend health: http://localhost:5000/health
2. Check API health: http://localhost:5000/api/health
3. Test listings API: http://localhost:5000/api/v1/listings
4. Use browser dev tools to inspect network requests

## 📊 Monitoring

### Health Checks

- Backend: `GET /health`
- API: `GET /api/health`
- Frontend: Connection test component

### Logs

- Backend logs: Console output
- Frontend logs: Browser dev tools
- Network logs: Browser network tab

## 🔒 Security

### Authentication

- JWT tokens stored in localStorage
- Automatic token refresh
- Logout on 401 errors

### CORS

- Configured for localhost development
- Production URLs should be added for deployment

## 🚀 Production Deployment

### Environment Variables

Update for production:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### CORS Configuration

Update backend CORS for production:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## 📝 API Documentation

### Available Endpoints

- `GET /api/health` - Health check
- `GET /api/v1/listings` - Get all listings
- `GET /api/v1/listings/:id` - Get single listing
- `POST /api/v1/listings` - Create listing
- `PUT /api/v1/listings/:id` - Update listing
- `DELETE /api/v1/listings/:id` - Delete listing

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

## 🎯 Next Steps

1. Add authentication endpoints
2. Implement user management
3. Add real-time features with Socket.IO
4. Implement file upload functionality
5. Add search and filtering
6. Implement payment integration
