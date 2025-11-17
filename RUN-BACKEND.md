# How to Run the Backend Server

## Quick Start

### Option 1: From Root Directory (Recommended)
```bash
# Navigate to your workspace root
cd "E:\vivek parmar"

# Run backend
npm run dev:backend
```

### Option 2: From Backend Directory
```bash
# Navigate to backend folder
cd "E:\vivek parmar\backend"

# Install dependencies (if not already done)
npm install

# Run the server
npm start
# OR for development with auto-reload
npm run dev
```

## What You'll See

When the backend starts successfully, you should see:
```
🚀 Server running on port 5000
📊 Health check: http://localhost:5000/health
🔗 API endpoint: http://localhost:5000/api/health
📱 Listings API: http://localhost:5000/api/v1/listings
```

## Important Notes

1. **Keep the terminal open** - The backend must keep running while you use the app
2. **Port 5000** - Make sure nothing else is using port 5000
3. **MongoDB/Redis** - If your backend requires these, make sure they're running too

## Running Both Backend and Android App

### Terminal 1: Backend
```bash
cd "E:\vivek parmar"
npm run dev:backend
```

### Android Studio: Android App
- Open Android Studio
- Open the `app` folder as a project
- Click "Run" button (green play icon)
- Select your emulator or device

## Troubleshooting

### Port Already in Use
If port 5000 is busy:
```bash
# Windows: Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Backend Not Starting
1. Check if Node.js is installed: `node --version` (should be 16+)
2. Install dependencies: `cd backend && npm install`
3. Check for errors in the terminal output

### Android App Can't Connect
1. Make sure backend is running on port 5000
2. For emulator: Backend URL is `http://10.0.2.2:5000/` (already configured)
3. For physical device: Update `ApiConfig.kt` with your computer's IP address
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update: `app/src/main/java/com/example/buyandsell/config/ApiConfig.kt`

## Testing Connection

Once backend is running, test it:
```bash
# In a new terminal
curl http://localhost:5000/health
curl http://localhost:5000/api/v1/listings
```

You should get JSON responses if everything is working!




