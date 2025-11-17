#!/usr/bin/env node

/**
 * Generate secure random secrets for environment variables
 * Run this script to generate JWT secrets and other secure tokens
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Environment Variables\n');
console.log('='.repeat(70));
console.log('\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);
console.log('\n');

// Generate JWT Refresh Secret
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);
console.log('\n');

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET=' + sessionSecret);
console.log('\n');

// Generate Webhook Secret
const webhookSecret = crypto.randomBytes(32).toString('hex');
console.log('RAZORPAY_WEBHOOK_SECRET=' + webhookSecret);
console.log('\n');

console.log('='.repeat(70));
console.log('\n✅ Copy the above secrets to your .env file\n');
console.log('⚠️  Keep these secrets secure and never commit them to git!\n');


