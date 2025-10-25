#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Next.js cache and HMR chunks...');

const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  '.next/static/chunks',
  '.next/static/css',
  '.next/static/js'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Also clear browser cache related files
const browserCacheFiles = [
  '.next/static/chunks/main-app.js',
  '.next/static/chunks/webpack.js',
  '.next/static/chunks/framework.js'
];

browserCacheFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${file}...`);
    fs.unlinkSync(fullPath);
  }
});

console.log('✅ Cache and HMR chunks cleared!');
console.log('✅ This should fix the ERR_CONNECTION_RESET error');
console.log('Run: npm run dev');
