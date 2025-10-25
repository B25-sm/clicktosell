# 🛠️ Troubleshooting Guide

This guide helps you resolve common issues with the OLX Classifieds application.

## 🚨 Critical Errors Fixed

### 1. Hydration Warnings
**Problem**: `Warning: Extra attributes from the server: data-new-gr-c-s-check-loaded,data-gr-ext-installed`

**Solution**: Added `suppressHydrationWarning={true}` to html and body elements in layout.tsx

### 2. Webpack Module Loading Errors
**Problem**: `Cannot read properties of undefined (reading 'call')`

**Solution**: 
- Updated webpack configuration in next.config.js
- Added proper fallbacks for Node.js modules
- Simplified component structure

### 3. React Component Crashes
**Problem**: Multiple error boundaries triggered

**Solution**: 
- Created ErrorBoundary component
- Wrapped providers with error boundary
- Added proper error handling

### 4. Image Loading Errors
**Problem**: `Failed to load resource: net::ERR_NAME_NOT_RESOLVED`

**Solution**: 
- Created PlaceholderImage component
- Added fallback SVG images
- Implemented error handling for images

## 🔧 Quick Fixes

### Clear Cache and Restart
```bash
# Clear Next.js cache
cd frontend-web
npm run clear-cache

# Or use the clean development command
npm run dev:clean
```

### Restart Development Servers
```bash
# Stop all servers (Ctrl+C)
# Then restart
npm run dev
```

### Check Backend Connection
```bash
# Test backend health
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api/v1/listings
```

## 🐛 Common Issues

### Issue 1: Hydration Warnings Still Appearing
**Symptoms**: Console shows hydration warnings
**Fix**: 
1. Ensure `suppressHydrationWarning={true}` is on both html and body
2. Check for browser extensions (Grammarly, etc.)
3. Clear browser cache

### Issue 2: Module Loading Errors
**Symptoms**: `Cannot read properties of undefined (reading 'call')`
**Fix**:
1. Clear Next.js cache: `npm run clear-cache`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Restart development server

### Issue 3: Images Not Loading
**Symptoms**: Broken image icons or failed resource loads
**Fix**:
1. Check if backend is running
2. Verify API endpoints are working
3. Use PlaceholderImage component for fallbacks

### Issue 4: React Crashes
**Symptoms**: White screen or error boundaries triggered
**Fix**:
1. Check browser console for specific errors
2. Verify all imports are correct
3. Check if all required components exist

## 🔍 Debugging Steps

### 1. Check Console Errors
Open browser dev tools and look for:
- Red error messages
- Yellow warnings
- Network request failures

### 2. Verify Backend Connection
```bash
# Test backend health
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"API is working","timestamp":"..."}
```

### 3. Check Network Requests
In browser dev tools:
1. Go to Network tab
2. Refresh page
3. Look for failed requests (red entries)
4. Check if API calls are successful

### 4. Verify File Structure
Ensure these files exist:
- `frontend-web/src/app/layout.tsx`
- `frontend-web/src/app/page.tsx`
- `frontend-web/src/lib/api.ts`
- `frontend-web/src/hooks/useApi.ts`

## 🚀 Development Commands

### Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run backend  # Terminal 1
npm run web      # Terminal 2
```

### Clear Cache
```bash
# Clear Next.js cache
cd frontend-web
npm run clear-cache

# Clean development start
npm run dev:clean
```

### Test Connection
```bash
# Test backend connection
npm run test:connection

# Test frontend
npm run test:frontend
```

## 📋 Health Checks

### Backend Health
- URL: http://localhost:5000/health
- Should return JSON with status "OK"

### Frontend Health
- URL: http://localhost:3000
- Should load without errors
- Check browser console for warnings

### API Health
- URL: http://localhost:5000/api/health
- Should return API status

### Connection Test
- URL: http://localhost:3000/test
- Click "Test Backend Connection"
- Should show success message

## 🔧 Advanced Troubleshooting

### If Nothing Works
1. **Complete Reset**:
   ```bash
   # Stop all servers
   # Delete node_modules
   rm -rf node_modules
   rm -rf frontend-web/node_modules
   rm -rf backend/node_modules
   
   # Clear all caches
   npm run clear-cache
   
   # Reinstall everything
   npm run install-all
   
   # Restart
   npm run dev
   ```

2. **Check Ports**:
   ```bash
   # Check if ports are in use
   netstat -an | grep 3000
   netstat -an | grep 5000
   
   # Kill processes if needed
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

3. **Environment Issues**:
   - Check Node.js version: `node --version` (should be 16+)
   - Check npm version: `npm --version`
   - Clear npm cache: `npm cache clean --force`

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at both frontend and backend console output
2. **Verify environment**: Ensure all dependencies are installed
3. **Test individually**: Try running frontend and backend separately
4. **Check network**: Ensure no firewall is blocking the connection
5. **Browser issues**: Try a different browser or incognito mode

## ✅ Success Indicators

Your application is working correctly when:
- ✅ No console errors or warnings
- ✅ Backend responds to health checks
- ✅ Frontend loads without crashes
- ✅ API calls return data successfully
- ✅ Images load or show fallbacks
- ✅ Connection test passes

## 🎯 Next Steps

Once everything is working:
1. Test the connection at http://localhost:3000/test
2. Verify data is loading from the backend
3. Check that images are displaying properly
4. Ensure no console errors remain

Happy coding! 🚀
