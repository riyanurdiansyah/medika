const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const testConfig = {
  userId: 'test-user-id', // Replace with actual user ID
  timeout: 5000
};

// Utility function for making requests
async function makeRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: testConfig.timeout,
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

// Test functions
async function testGetAllUsers() {
  console.log('🧪 Testing GET /api/users (Get all users)');
  
  const result = await makeRequest(`${BASE_URL}/api/users`);
  
  console.log(`Status: ${result.status}`);
  if (result.ok) {
    console.log('✅ Success!');
    console.log(`Users count: ${result.data.count || 0}`);
    console.log('Sample user data:', result.data.data?.[0] || 'No users found');
  } else {
    console.log('❌ Failed!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

async function testGetUserById() {
  console.log('🧪 Testing GET /api/users/{id} (Get specific user)');
  
  const result = await makeRequest(`${BASE_URL}/api/users/${testConfig.userId}`);
  
  console.log(`Status: ${result.status}`);
  if (result.ok) {
    console.log('✅ Success!');
    console.log('User data:', result.data.data);
  } else if (result.status === 404) {
    console.log('⚠️  User not found (expected for test ID)');
  } else {
    console.log('❌ Failed!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

async function testUpdateUser() {
  console.log('🧪 Testing PUT /api/users/{id} (Update user)');
  
  const updateData = {
    fullname: 'Updated Test User',
    role: 'admin',
    status: 'active'
  };
  
  const result = await makeRequest(`${BASE_URL}/api/users/${testConfig.userId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  
  console.log(`Status: ${result.status}`);
  if (result.ok) {
    console.log('✅ Success!');
    console.log('Message:', result.data.message);
  } else {
    console.log('❌ Failed!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

async function testDeleteUser() {
  console.log('🧪 Testing DELETE /api/users/{id} (Delete user)');
  
  const result = await makeRequest(`${BASE_URL}/api/users/${testConfig.userId}`, {
    method: 'DELETE'
  });
  
  console.log(`Status: ${result.status}`);
  if (result.ok) {
    console.log('✅ Success!');
    console.log('Message:', result.data.message);
  } else {
    console.log('❌ Failed!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

async function testInvalidMethod() {
  console.log('🧪 Testing POST /api/users (Invalid method - should return 405)');
  
  const result = await makeRequest(`${BASE_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify({ test: 'data' })
  });
  
  console.log(`Status: ${result.status}`);
  if (result.status === 405) {
    console.log('✅ Correctly rejected invalid method!');
  } else {
    console.log('❌ Unexpected response!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

async function testInvalidUserId() {
  console.log('🧪 Testing GET /api/users/invalid-id (Invalid user ID - should return 404)');
  
  const result = await makeRequest(`${BASE_URL}/api/users/invalid-id`);
  
  console.log(`Status: ${result.status}`);
  if (result.status === 404) {
    console.log('✅ Correctly handled invalid user ID!');
  } else {
    console.log('❌ Unexpected response!');
    console.log('Error:', result.data?.error || result.error);
  }
  console.log('---');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testGetAllUsers();
  await testGetUserById();
  await testUpdateUser();
  await testDeleteUser();
  await testInvalidMethod();
  await testInvalidUserId();
  
  console.log('✅ All tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, { timeout: 3000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running! Please start your Next.js development server:');
    console.log('   npm run dev');
    console.log('   or');
    console.log('   yarn dev');
    return;
  }
  
  console.log('✅ Server is running!\n');
  await runAllTests();
}

// Run the tests
main().catch(console.error); 