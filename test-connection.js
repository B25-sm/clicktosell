#!/usr/bin/env node

/**
 * Connection test script for OLX Classifieds
 * Tests the connection between frontend and backend
 */

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Testing Backend & Frontend Connection...\n');

  try {
    // Test backend health
    console.log('📡 Testing Backend Server...');
    const backendResponse = await fetch(`${BACKEND_URL}/health`);
    if (backendResponse.ok) {
      const backendHealth = await backendResponse.json();
      console.log('✅ Backend Server: OK');
      console.log(`   Status: ${backendHealth.status}`);
      console.log(`   Message: ${backendHealth.message}`);
    } else {
      throw new Error(`Backend health check failed: ${backendResponse.status}`);
    }

    // Test API health
    console.log('\n🔌 Testing API Endpoint...');
    const apiResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (apiResponse.ok) {
      const apiHealth = await apiResponse.json();
      console.log('✅ API Endpoint: OK');
      console.log(`   Status: ${apiHealth.status}`);
    } else {
      throw new Error(`API health check failed: ${apiResponse.status}`);
    }

    // Test listings endpoint
    console.log('\n📋 Testing Listings API...');
    const listingsResponse = await fetch(`${BACKEND_URL}/api/v1/listings`);
    if (listingsResponse.ok) {
      const listings = await listingsResponse.json();
      console.log('✅ Listings API: OK');
      console.log(`   Found ${listings.data.listings.length} listings`);
    } else {
      throw new Error(`Listings API failed: ${listingsResponse.status}`);
    }

    // Test categories endpoint
    console.log('\n📂 Testing Categories API...');
    const categoriesResponse = await fetch(`${BACKEND_URL}/api/v1/categories`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('✅ Categories API: OK');
      console.log(`   Found ${categories.data.length} categories`);
    } else {
      throw new Error(`Categories API failed: ${categoriesResponse.status}`);
    }

    // Test frontend (if running)
    console.log('\n🌐 Testing Frontend Server...');
    try {
      const frontendResponse = await fetch(FRONTEND_URL, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (frontendResponse.ok) {
        console.log('✅ Frontend Server: OK');
        console.log(`   Status: ${frontendResponse.status}`);
      } else {
        throw new Error(`Frontend returned ${frontendResponse.status}`);
      }
    } catch (error) {
      console.log('⚠️  Frontend Server: Not running or not accessible');
      console.log('   Make sure to start the frontend with: npm run dev:frontend');
    }

    console.log('\n🎉 Connection test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: npm run dev:backend');
    console.log('   2. Start frontend: npm run dev:frontend');
    console.log('   3. Or start both: npm run dev');
    console.log('   4. Open http://localhost:3000 in your browser');

  } catch (error) {
    console.error('❌ Connection test failed:');
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.error('   Backend server is not running');
      console.error('   Start it with: npm run dev:backend');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testConnection();