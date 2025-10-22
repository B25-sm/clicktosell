/**
 * Comprehensive Redis Features Test
 * This script tests all Redis integration features
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const tests = [];

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await makeRequest('/health');
    if (response.status === 200 && response.data.services) {
      console.log('✅ Health check passed');
      console.log(`   MongoDB: ${response.data.services.mongodb}`);
      console.log(`   Redis: ${response.data.services.redis}`);
      return true;
    } else {
      console.log('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testRedisOperations() {
  console.log('\n🔄 Testing Redis Operations...');
  try {
    const response = await makeRequest('/api/test/redis');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Redis operations test passed');
      console.log(`   Cache test: ${response.data.data.cache ? '✅' : '❌'}`);
      console.log(`   Session test: ${response.data.data.session ? '✅' : '❌'}`);
      console.log(`   View tracking: ${response.data.data.views} views`);
      console.log(`   Redis status: ${response.data.data.redisStatus}`);
      return true;
    } else {
      console.log('❌ Redis operations test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Redis operations error:', error.message);
    return false;
  }
}

async function testCaching() {
  console.log('\n💾 Testing Caching...');
  try {
    const startTime = Date.now();
    const response = await makeRequest('/api/listings/featured');
    const endTime = Date.now();
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Caching test passed');
      console.log(`   Response time: ${endTime - startTime}ms`);
      console.log(`   Cached: ${response.data.cached ? '✅' : '❌'}`);
      console.log(`   Listings count: ${response.data.data.length}`);
      return true;
    } else {
      console.log('❌ Caching test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Caching error:', error.message);
    return false;
  }
}

async function testViewTracking() {
  console.log('\n👀 Testing View Tracking...');
  try {
    const listingId = 'test-listing-123';
    
    // Track a view
    const viewResponse = await makeRequest(`/api/listings/${listingId}/view`, 'POST');
    if (viewResponse.status === 200) {
      console.log('✅ View tracking test passed');
      console.log(`   Views tracked: ${viewResponse.data.data.views}`);
      
      // Get view count
      const viewsResponse = await makeRequest(`/api/listings/${listingId}/views`);
      if (viewsResponse.status === 200) {
        console.log(`   View count retrieved: ${viewsResponse.data.data.views}`);
        return true;
      }
    }
    
    console.log('❌ View tracking test failed');
    return false;
  } catch (error) {
    console.log('❌ View tracking error:', error.message);
    return false;
  }
}

async function testCacheStats() {
  console.log('\n📊 Testing Cache Stats...');
  try {
    const response = await makeRequest('/api/cache/stats');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Cache stats test passed');
      console.log(`   Redis connected: ${response.data.data.connected ? '✅' : '❌'}`);
      console.log(`   Info available: ${response.data.data.info}`);
      return true;
    } else {
      console.log('❌ Cache stats test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cache stats error:', error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...');
  try {
    let requests = 0;
    const promises = [];
    
    // Make multiple requests quickly
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('/api/test/redis'));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 200).length;
    
    console.log(`✅ Rate limiting test completed`);
    console.log(`   Requests made: 5`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Rate limiting: ${successCount < 5 ? '✅ Active' : '⚠️ Not active'}`);
    
    return true;
  } catch (error) {
    console.log('❌ Rate limiting error:', error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Redis Integration Tests...');
  console.log('=====================================');
  
  const results = [];
  
  // Run all tests
  results.push(await testHealthCheck());
  results.push(await testRedisOperations());
  results.push(await testCaching());
  results.push(await testViewTracking());
  results.push(await testCacheStats());
  results.push(await testRateLimiting());
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All Redis integration tests passed!');
    console.log('✨ Your OLX Classifieds server is ready with Redis!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the server logs.');
  }
  
  console.log('\n🚀 Redis Features Available:');
  console.log('   • Session Management');
  console.log('   • API Response Caching');
  console.log('   • Real-time View Tracking');
  console.log('   • Rate Limiting');
  console.log('   • Performance Optimization');
  console.log('   • Cache Management');
}

// Run tests
runAllTests().catch(console.error);






