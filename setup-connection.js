#!/usr/bin/env node

/**
 * OLX Classifieds - Backend & Frontend Connection Setup Script
 * This script sets up the connection between backend and frontend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Backend & Frontend Connection...\n');

// Backend environment configuration
const backendEnv = `# OLX Classifieds Backend Environment Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/olx-classifieds
REDIS_URL=redis://localhost:6379

# JWT Secrets (Generated - Keep Secure!)
JWT_SECRET=9de1b20623ed27d0274b933962097cafb4f59ead44fc721b238271eef14d960a3ab795bcdf5d8a6a92500d2845355c
JWT_REFRESH_SECRET=ba27f7f3a5ef61e7ea572661964f4d36b91a5769ed477e0e01b47802dd07ebfe12c4b987cebd45c6db079c1281126c353443ab167f8a593b42ccd02b870ebc82
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=OLX Classifieds

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# AWS S3 File Storage
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Firebase Push Notifications
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# External Services
ELASTICSEARCH_URL=http://localhost:9200

# Sentry Error Tracking (Optional)
SENTRY_DSN=your_sentry_dsn_for_error_tracking`;

// Frontend environment configuration
const frontendEnv = `# OLX Classifieds Frontend Environment Configuration
# This file is for local development only

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_VERSION=v1

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx

# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# App Configuration
NEXT_PUBLIC_APP_NAME=OLX Classifieds
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false`;

// Development startup script
const devStartScript = `#!/usr/bin/env node

/**
 * Development startup script for OLX Classifieds
 * Starts both backend and frontend in development mode
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OLX Classifieds Development Environment...\\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\\n🌐 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend-web'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down development servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  frontend.on('close', (code) => {
    console.log(\`Frontend process exited with code \${code}\`);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(\`Backend process exited with code \${code}\`);
});

console.log('\\n✅ Development servers starting...');
console.log('📡 Backend: http://localhost:5000');
console.log('🌐 Frontend: http://localhost:3000');
console.log('\\nPress Ctrl+C to stop both servers');`;

// Connection test script
const connectionTestScript = `#!/usr/bin/env node

/**
 * Connection test script for OLX Classifieds
 * Tests the connection between frontend and backend
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Testing Backend & Frontend Connection...\\n');

  try {
    // Test backend health
    console.log('📡 Testing Backend Server...');
    const backendHealth = await axios.get(\`\${BACKEND_URL}/health\`);
    console.log('✅ Backend Server: OK');
    console.log(\`   Status: \${backendHealth.data.status}\`);
    console.log(\`   Message: \${backendHealth.data.message}\`);

    // Test API health
    console.log('\\n🔌 Testing API Endpoint...');
    const apiHealth = await axios.get(\`\${BACKEND_URL}/api/health\`);
    console.log('✅ API Endpoint: OK');
    console.log(\`   Status: \${apiHealth.data.status}\`);

    // Test listings endpoint
    console.log('\\n📋 Testing Listings API...');
    const listings = await axios.get(\`\${BACKEND_URL}/api/v1/listings\`);
    console.log('✅ Listings API: OK');
    console.log(\`   Found \${listings.data.data.listings.length} listings\`);

    // Test frontend (if running)
    console.log('\\n🌐 Testing Frontend Server...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log('✅ Frontend Server: OK');
      console.log(\`   Status: \${frontendResponse.status}\`);
    } catch (error) {
      console.log('⚠️  Frontend Server: Not running or not accessible');
      console.log('   Make sure to start the frontend with: npm run dev');
    }

    console.log('\\n🎉 Connection test completed successfully!');
    console.log('\\n📝 Next steps:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend-web && npm run dev');
    console.log('   3. Open http://localhost:3000 in your browser');

  } catch (error) {
    console.error('❌ Connection test failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server is not running');
      console.error('   Start it with: cd backend && npm run dev');
    } else {
      console.error(\`   Error: \${error.message}\`);
    }
    process.exit(1);
  }
}

testConnection();`;

// Package.json scripts for easy development
const packageJsonScripts = {
  "scripts": {
    "dev": "node dev-start.js",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend-web && npm run dev",
    "test:connection": "node test-connection.js",
    "setup": "node setup-connection.js",
    "install:all": "npm install && cd backend && npm install && cd ../frontend-web && npm install"
  }
};

try {
  // Create backend .env file
  console.log('📝 Creating backend environment file...');
  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
  console.log('✅ Backend .env created');

  // Create frontend .env.local file
  console.log('📝 Creating frontend environment file...');
  fs.writeFileSync(path.join(__dirname, 'frontend-web', '.env.local'), frontendEnv);
  console.log('✅ Frontend .env.local created');

  // Create development startup script
  console.log('📝 Creating development startup script...');
  fs.writeFileSync(path.join(__dirname, 'dev-start.js'), devStartScript);
  console.log('✅ Development startup script created');

  // Create connection test script
  console.log('📝 Creating connection test script...');
  fs.writeFileSync(path.join(__dirname, 'test-connection.js'), connectionTestScript);
  console.log('✅ Connection test script created');

  // Update root package.json with development scripts
  console.log('📝 Updating root package.json...');
  const rootPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  rootPackageJson.scripts = { ...rootPackageJson.scripts, ...packageJsonScripts.scripts };
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(rootPackageJson, null, 2));
  console.log('✅ Root package.json updated');

  console.log('\\n🎉 Backend & Frontend connection setup completed!');
  console.log('\\n📋 Next steps:');
  console.log('   1. Install dependencies: npm run install:all');
  console.log('   2. Test connection: npm run test:connection');
  console.log('   3. Start development: npm run dev');
  console.log('\\n🔗 URLs:');
  console.log('   Backend: http://localhost:5000');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API Health: http://localhost:5000/health');
  console.log('   API Listings: http://localhost:5000/api/v1/listings');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
