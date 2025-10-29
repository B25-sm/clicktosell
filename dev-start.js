#!/usr/bin/env node

/**
 * Development startup script for OLX Classifieds
 * Starts both backend and frontend in development mode
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OLX Classifieds Development Environment...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🌐 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend-web'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

console.log('\n✅ Development servers starting...');
console.log('📡 Backend: http://localhost:5000');
console.log('🌐 Frontend: http://localhost:3000');
console.log('\nPress Ctrl+C to stop both servers');