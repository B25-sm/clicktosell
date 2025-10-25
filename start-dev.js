#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OLX Classifieds Development Environment...\n');

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

// Handle backend errors
backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

// Handle frontend errors
frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

console.log('✅ Development servers started!');
console.log('📡 Backend: http://localhost:5000');
console.log('🌐 Frontend: http://localhost:3000');
console.log('🧪 Test Page: http://localhost:3000/test');
console.log('\nPress Ctrl+C to stop both servers');
