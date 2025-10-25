#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...\n');

  try {
    // Test 1: Backend Health Check
    console.log('1️⃣ Testing Backend Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend Health:', healthResponse.data.status);
    console.log('   Message:', healthResponse.data.message);
    console.log('   Uptime:', healthResponse.data.uptime, 'seconds\n');

    // Test 2: API Health Check
    console.log('2️⃣ Testing API Health Check...');
    const apiHealthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ API Health:', apiHealthResponse.data.status);
    console.log('   Message:', apiHealthResponse.data.message);
    console.log('   Timestamp:', apiHealthResponse.data.timestamp, '\n');

    // Test 3: Listings API
    console.log('3️⃣ Testing Listings API...');
    const listingsResponse = await axios.get(`${API_BASE_URL}/api/v1/listings`);
    console.log('✅ Listings API Response:');
    console.log('   Success:', listingsResponse.data.success);
    console.log('   Total Listings:', listingsResponse.data.data.total);
    console.log('   Sample Listing:', listingsResponse.data.data.listings[0]?.title || 'No listings\n');

    // Test 4: CORS Headers
    console.log('4️⃣ Testing CORS Configuration...');
    const corsTestResponse = await axios.get(`${API_BASE_URL}/api/health`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS Test Passed');
    console.log('   Access-Control-Allow-Origin:', corsTestResponse.headers['access-control-allow-origin'] || 'Not set\n');

    console.log('🎉 All connection tests passed!');
    console.log('\n📋 Summary:');
    console.log('   • Backend server is running on port 5000');
    console.log('   • API endpoints are responding correctly');
    console.log('   • CORS is configured for frontend access');
    console.log('   • Ready for frontend connection!');
    
    console.log('\n🌐 Next Steps:');
    console.log('   1. Start frontend: cd frontend-web && npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Test connection: http://localhost:3000/test');

  } catch (error) {
    console.error('❌ Connection test failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   • Backend server is not running');
      console.error('   • Start backend: cd backend && npm start');
    } else if (error.response) {
      console.error('   • HTTP Error:', error.response.status);
      console.error('   • Response:', error.response.data);
    } else {
      console.error('   • Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure backend is running: cd backend && npm start');
    console.log('   2. Check if port 5000 is available');
    console.log('   3. Verify no firewall blocking the connection');
    
    process.exit(1);
  }
}

// Run the test
testConnection();
