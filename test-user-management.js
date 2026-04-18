// USER MANAGEMENT TEST SCRIPT
// Test all user management endpoints

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealth() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`✅ Health Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    return response.statusCode === 200;
  } catch (error) {
    console.log('❌ Health test failed:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔍 Testing Login Endpoint...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'admin',
      password: 'password123'
    });
    
    console.log(`✅ Login Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 200 && response.body.token) {
      console.log('🎉 Login successful! Token received.');
      return response.body.token;
    } else {
      console.log('❌ Login failed - admin user may not exist yet.');
      return null;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return null;
  }
}

async function testUserCreation(token) {
  console.log('\n🔍 Testing User Creation...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      username: 'enc_testuser',
      fullName: 'Test User',
      email: 'testuser@dti.gov.ph',
      password: 'password123',
      role: 'encoder'
    });
    
    console.log(`✅ User Creation Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 201) {
      console.log('🎉 User creation successful!');
      return true;
    } else {
      console.log('❌ User creation failed.');
      return false;
    }
  } catch (error) {
    console.log('❌ User creation test failed:', error.message);
    return false;
  }
}

async function testUserList(token) {
  console.log('\n🔍 Testing User List...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ User List Status: ${response.statusCode}`);
    if (response.body && Array.isArray(response.body)) {
      console.log(`🎉 Found ${response.body.length} users`);
      response.body.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - ${user.status}`);
      });
      return true;
    } else {
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ User list test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting User Management Tests...');
  console.log('=====================================');
  
  // Test 1: Health check
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('❌ Server is not responding. Please start the backend server.');
    return;
  }
  
  // Test 2: Login (may fail if admin user doesn't exist)
  const token = await testLogin();
  
  if (token) {
    // Test 3: User creation (requires authentication)
    await testUserCreation(token);
    
    // Test 4: User list (requires authentication)
    await testUserList(token);
  } else {
    console.log('\n💡 To test user management, you need to:');
    console.log('1. Create an admin user in the Supabase database');
    console.log('2. Use username: admin, password: password123');
    console.log('3. Make sure the password_hash column has the correct bcrypt hash');
  }
  
  console.log('\n🏁 User Management Tests Complete!');
}

// Run the tests
runTests().catch(console.error);
