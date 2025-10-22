const http = require('http');

const BASE_URL = 'http://localhost:5000';

console.log('🧪 Testing Razorpay Payment Gateway...');
console.log('=====================================\n');

// Simple HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
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

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   MongoDB: ${response.data.services.mongodb}`);
      console.log(`   Redis: ${response.data.services.redis}\n`);
      return true;
    } else {
      console.log('❌ Health check failed:', response.status, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message, '\n');
    return false;
  }
}

// Test 2: Test Payment Endpoints (without auth for now)
async function testPaymentEndpoints() {
  console.log('💳 Testing Payment Endpoints...');
  
  try {
    // Test payment routes exist (should return 401 without auth)
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/payments/create-order',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      amount: 100,
      currency: 'INR'
    });
    
    if (response.status === 401) {
      console.log('✅ Payment endpoints are accessible (auth required)');
      console.log('   Status: 401 Unauthorized (expected without auth token)\n');
      return true;
    } else {
      console.log('⚠️ Unexpected response:', response.status, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Payment endpoint test failed:', error.message, '\n');
    return false;
  }
}

// Test 3: Test Razorpay Connection (without auth)
async function testRazorpayConnection() {
  console.log('🔗 Testing Razorpay Connection Endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/payments/test/connection',
      method: 'GET'
    });
    
    if (response.status === 401) {
      console.log('✅ Razorpay connection endpoint accessible');
      console.log('   Status: 401 Unauthorized (expected without auth token)\n');
      return true;
    } else {
      console.log('⚠️ Unexpected response:', response.status, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Razorpay connection test failed:', error.message, '\n');
    return false;
  }
}

// Test 4: Test Payment Verification Endpoint
async function testPaymentVerification() {
  console.log('🔍 Testing Payment Verification Endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/payments/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      orderId: 'test_order',
      paymentId: 'test_payment',
      signature: 'test_signature'
    });
    
    if (response.status === 401) {
      console.log('✅ Payment verification endpoint accessible');
      console.log('   Status: 401 Unauthorized (expected without auth token)\n');
      return true;
    } else {
      console.log('⚠️ Unexpected response:', response.status, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Payment verification test failed:', error.message, '\n');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Razorpay Integration Tests...');
  console.log('==========================================\n');

  let passedTests = 0;
  let totalTests = 4;

  // Run all tests
  const healthCheck = await testHealthCheck();
  if (healthCheck) passedTests++;

  const paymentEndpoints = await testPaymentEndpoints();
  if (paymentEndpoints) passedTests++;

  const connectionTest = await testRazorpayConnection();
  if (connectionTest) passedTests++;

  const verificationTest = await testPaymentVerification();
  if (verificationTest) passedTests++;

  // Summary
  console.log('📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All Razorpay endpoint tests passed!');
    console.log('✨ Your payment gateway endpoints are ready!\n');
    
    console.log('🚀 Next Steps:');
    console.log('   1. Get Razorpay credentials from dashboard');
    console.log('   2. Add them to your .env file:');
    console.log('      RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx');
    console.log('      RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx');
    console.log('   3. Set up authentication middleware');
    console.log('   4. Test with real payments\n');
  } else {
    console.log('⚠️ Some tests failed - check server logs');
    console.log('✨ Make sure your server is running on port 5000\n');
  }

  console.log('🔧 Razorpay Setup Required:');
  console.log('   1. Sign up at https://dashboard.razorpay.com/');
  console.log('   2. Get your Key ID and Key Secret');
  console.log('   3. Copy razorpay-env-template to your .env file');
  console.log('   4. Update the template with your real credentials');
}

// Run tests
runTests().catch(console.error);






