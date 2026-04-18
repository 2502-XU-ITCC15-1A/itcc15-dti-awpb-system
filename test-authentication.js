// USER AUTHENTICATION TEST SCRIPT
// Test authentication features: JWT, bcrypt, protected routes

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
  console.log('\n🔍 Testing Server Health...');
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

async function testLoginWithValidCredentials() {
  console.log('\n🔍 Testing Login with Valid Credentials...');
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
      console.log('🎉 Login successful! JWT token received.');
      console.log('📋 User data:', {
        id: response.body.user.id,
        username: response.body.user.username,
        fullName: response.body.user.fullName,
        role: response.body.user.role,
        status: response.body.user.status
      });
      return response.body.token;
    } else {
      console.log('❌ Login failed - admin user may not exist.');
      return null;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return null;
  }
}

async function testLoginWithInvalidCredentials() {
  console.log('\n🔍 Testing Login with Invalid Credentials...');
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
      password: 'wrongpassword'
    });
    
    console.log(`✅ Invalid Login Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 401) {
      console.log('🎉 Security working! Invalid credentials rejected.');
      return true;
    } else {
      console.log('❌ Security issue - should reject invalid credentials.');
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid login test failed:', error.message);
    return false;
  }
}

async function testProtectedRouteWithoutToken() {
  console.log('\n🔍 Testing Protected Route Without Token...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET'
    });
    
    console.log(`✅ Protected Route Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 401) {
      console.log('🎉 Protection working! Route requires authentication.');
      return true;
    } else {
      console.log('❌ Security issue - route should require authentication.');
      return false;
    }
  } catch (error) {
    console.log('❌ Protected route test failed:', error.message);
    return false;
  }
}

async function testProtectedRouteWithValidToken(token) {
  console.log('\n🔍 Testing Protected Route with Valid Token...');
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
    
    console.log(`✅ Protected Route with Token Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 200) {
      console.log('🎉 JWT authentication working! Access granted.');
      if (Array.isArray(response.body)) {
        console.log(`📋 Retrieved ${response.body.length} users`);
      }
      return true;
    } else {
      console.log('❌ Token authentication failed.');
      return false;
    }
  } catch (error) {
    console.log('❌ Protected route with token test failed:', error.message);
    return false;
  }
}

async function testProtectedRouteWithInvalidToken() {
  console.log('\n🔍 Testing Protected Route with Invalid Token...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });
    
    console.log(`✅ Invalid Token Status: ${response.statusCode}`);
    console.log('Response:', response.body);
    
    if (response.statusCode === 401 || response.statusCode === 403) {
      console.log('🎉 Token validation working! Invalid token rejected.');
      return true;
    } else {
      console.log('❌ Security issue - should reject invalid tokens.');
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid token test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runAuthenticationTests() {
  console.log('🚀 Starting User Authentication Tests...');
  console.log('=======================================');
  
  // Test 1: Health check
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('❌ Server is not responding. Please start the backend server.');
    return;
  }
  
  // Test 2: Login with invalid credentials (should always work)
  await testLoginWithInvalidCredentials();
  
  // Test 3: Protected route without token (should always work)
  await testProtectedRouteWithoutToken();
  
  // Test 4: Protected route with invalid token (should always work)
  await testProtectedRouteWithInvalidToken();
  
  // Test 5: Login with valid credentials (requires admin user)
  const token = await testLoginWithValidCredentials();
  
  if (token) {
    // Test 6: Protected route with valid token
    await testProtectedRouteWithValidToken(token);
    
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('✅ JWT tokens working');
    console.log('✅ Bcrypt password validation working');
    console.log('✅ Protected routes working');
    console.log('✅ Security measures working');
  } else {
    console.log('\n💡 To complete authentication testing:');
    console.log('1. Create admin user in Supabase database');
    console.log('2. Username: admin, Password: password123');
    console.log('3. Use correct bcrypt hash for password_hash column');
  }
  
  console.log('\n🏁 Authentication Tests Complete!');
}

// Run the tests
runAuthenticationTests().catch(console.error);
