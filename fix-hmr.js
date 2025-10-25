#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing HMR and chunk loading issues...\n');

// Clear all Next.js cache directories
const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  '.next/static',
  '.next/static/chunks',
  '.next/static/css',
  '.next/static/js'
];

console.log('🧹 Clearing cache directories...');
cacheDirs.forEach(dir => {
  const fullPath = path.join(__dirname, 'frontend-web', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ Removing ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Clear specific HMR files
const hmrFiles = [
  '.next/static/chunks/main-app.js',
  '.next/static/chunks/webpack.js',
  '.next/static/chunks/framework.js',
  '.next/static/chunks/pages/_app.js',
  '.next/static/chunks/pages/_error.js'
];

console.log('\n🗑️ Clearing HMR chunk files...');
hmrFiles.forEach(file => {
  const fullPath = path.join(__dirname, 'frontend-web', file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ Removing ${file}`);
    fs.unlinkSync(fullPath);
  }
});

// Create a fresh .next directory structure
console.log('\n📁 Creating fresh .next structure...');
const nextDir = path.join(__dirname, 'frontend-web', '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
  console.log('  ✓ Created .next directory');
}

console.log('\n✅ HMR fix complete!');
console.log('📋 What was fixed:');
console.log('  • Cleared all Next.js cache directories');
console.log('  • Removed corrupted HMR chunk files');
console.log('  • Reset webpack compilation cache');
console.log('  • Created fresh .next structure');
console.log('\n🚀 Now restart the development server:');
console.log('  npm run dev');
console.log('\n💡 If the issue persists:');
console.log('  • Try a different browser');
console.log('  • Clear browser cache (Ctrl+Shift+R)');
console.log('  • Check if port 3000 is available');
