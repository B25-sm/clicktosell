#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting Development Environment...\n');

// Clear cache first
console.log('🧹 Clearing cache...');
const clearCache = spawn('node', ['clear-cache.js'], {
  cwd: path.join(__dirname, 'frontend-web'),
  stdio: 'inherit',
  shell: true
});

clearCache.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Cache cleared successfully\n');
    
    // Start development servers
    console.log('🚀 Starting development servers...');
    
    // Start Backend Server
    console.log('📡 Starting Backend Server...');
    const backend = spawn('node', ['fixed-server.js'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true
    });

    // Start Frontend Server
    console.log('🌐 Starting Frontend Server...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend-web'),
      stdio: 'inherit',
      shell: true
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      backend.kill('SIGINT');
      frontend.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down servers...');
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
      process.exit(0);
    });

    console.log('✅ Development servers started!');
    console.log('📡 Backend: http://localhost:5000');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🧪 Test Page: http://localhost:3000/test');
    console.log('\nPress Ctrl+C to stop both servers');
  } else {
    console.error('❌ Failed to clear cache');
    process.exit(1);
  }
});
