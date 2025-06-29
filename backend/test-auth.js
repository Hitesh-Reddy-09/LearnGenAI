const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api/auth';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
  confirmPassword: 'TestPass123!',
  role: 'user'
};

const testLoginData = {
  email: 'test@example.com',
  password: 'TestPass123!'
};

let authToken = '';
let refreshToken = '';

// Helper function to make requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testRegistration = async () => {
  console.log('\n🧪 Testing Registration...');
  
  // Test valid registration
  const result = await makeRequest('POST', '/register', testUser);
  
  if (result.success) {
    console.log('✅ Registration successful');
    console.log('   User ID:', result.data.data.user._id);
    console.log('   Token received:', !!result.data.data.token);
    console.log('   Refresh token received:', !!result.data.data.refreshToken);
    
    // Store tokens for other tests
    authToken = result.data.data.token;
    refreshToken = result.data.data.refreshToken;
  } else {
    console.log('❌ Registration failed:', result.error);
  }
  
  // Test duplicate registration
  const duplicateResult = await makeRequest('POST', '/register', testUser);
  if (!duplicateResult.success && duplicateResult.status === 409) {
    console.log('✅ Duplicate registration properly rejected');
  } else {
    console.log('❌ Duplicate registration not handled correctly');
  }
  
  // Test invalid registration (missing fields)
  const invalidResult = await makeRequest('POST', '/register', {
    name: 'Test',
    email: 'invalid-email'
  });
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('✅ Invalid registration properly rejected');
  } else {
    console.log('❌ Invalid registration not handled correctly');
  }
};

const testLogin = async () => {
  console.log('\n🧪 Testing Login...');
  
  // Test valid login
  const result = await makeRequest('POST', '/login', testLoginData);
  
  if (result.success) {
    console.log('✅ Login successful');
    console.log('   User ID:', result.data.data.user._id);
    console.log('   Token received:', !!result.data.data.token);
    console.log('   Refresh token received:', !!result.data.data.refreshToken);
    
    // Update tokens
    authToken = result.data.data.token;
    refreshToken = result.data.data.refreshToken;
  } else {
    console.log('❌ Login failed:', result.error);
  }
  
  // Test invalid login
  const invalidResult = await makeRequest('POST', '/login', {
    email: 'test@example.com',
    password: 'wrongpassword'
  });
  if (!invalidResult.success && invalidResult.status === 401) {
    console.log('✅ Invalid login properly rejected');
  } else {
    console.log('❌ Invalid login not handled correctly');
  }
};

const testGetMe = async () => {
  console.log('\n🧪 Testing Get Current User...');
  
  // Test with valid token
  const result = await makeRequest('GET', '/me', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Get current user successful');
    console.log('   User ID:', result.data.data.user._id);
    console.log('   User name:', result.data.data.user.name);
    console.log('   User email:', result.data.data.user.email);
  } else {
    console.log('❌ Get current user failed:', result.error);
  }
  
  // Test without token
  const noTokenResult = await makeRequest('GET', '/me');
  if (!noTokenResult.success && noTokenResult.status === 401) {
    console.log('✅ Unauthorized access properly rejected');
  } else {
    console.log('❌ Unauthorized access not handled correctly');
  }
};

const testUpdateProfile = async () => {
  console.log('\n🧪 Testing Update Profile...');
  
  const updateData = {
    name: 'Updated Test User',
    preferences: {
      difficulty: 'intermediate',
      language: 'en'
    }
  };
  
  const result = await makeRequest('PUT', '/me', updateData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Profile update successful');
    console.log('   Updated name:', result.data.data.user.name);
    console.log('   Updated preferences:', result.data.data.user.preferences);
  } else {
    console.log('❌ Profile update failed:', result.error);
  }
};

const testChangePassword = async () => {
  console.log('\n🧪 Testing Change Password...');
  
  const passwordData = {
    currentPassword: 'TestPass123!',
    newPassword: 'NewTestPass123!',
    confirmNewPassword: 'NewTestPass123!'
  };
  
  const result = await makeRequest('PUT', '/change-password', passwordData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Password change successful');
    
    // Update test login data
    testLoginData.password = 'NewTestPass123!';
  } else {
    console.log('❌ Password change failed:', result.error);
  }
};

const testForgotPassword = async () => {
  console.log('\n🧪 Testing Forgot Password...');
  
  const result = await makeRequest('POST', '/forgot-password', {
    email: testUser.email
  });
  
  if (result.success) {
    console.log('✅ Forgot password email sent');
  } else {
    console.log('❌ Forgot password failed:', result.error);
  }
  
  // Test with non-existent email
  const invalidResult = await makeRequest('POST', '/forgot-password', {
    email: 'nonexistent@example.com'
  });
  if (!invalidResult.success && invalidResult.status === 404) {
    console.log('✅ Non-existent email properly handled');
  } else {
    console.log('❌ Non-existent email not handled correctly');
  }
};

const testRefreshToken = async () => {
  console.log('\n🧪 Testing Refresh Token...');
  
  const result = await makeRequest('POST', '/refresh', {
    refreshToken: refreshToken
  });
  
  if (result.success) {
    console.log('✅ Token refresh successful');
    console.log('   New token received:', !!result.data.data.token);
    console.log('   New refresh token received:', !!result.data.data.refreshToken);
    
    // Update tokens
    authToken = result.data.data.token;
    refreshToken = result.data.data.refreshToken;
  } else {
    console.log('❌ Token refresh failed:', result.error);
  }
  
  // Test with invalid refresh token
  const invalidResult = await makeRequest('POST', '/refresh', {
    refreshToken: 'invalid-token'
  });
  if (!invalidResult.success && invalidResult.status === 401) {
    console.log('✅ Invalid refresh token properly rejected');
  } else {
    console.log('❌ Invalid refresh token not handled correctly');
  }
};

const testGetUserStats = async () => {
  console.log('\n🧪 Testing Get User Stats...');
  
  const result = await makeRequest('GET', '/stats', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Get user stats successful');
    console.log('   Stats:', result.data.data.stats);
  } else {
    console.log('❌ Get user stats failed:', result.error);
  }
};

const testLogout = async () => {
  console.log('\n🧪 Testing Logout...');
  
  const result = await makeRequest('POST', '/logout', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Logout successful');
  } else {
    console.log('❌ Logout failed:', result.error);
  }
};

const testRateLimiting = async () => {
  console.log('\n🧪 Testing Rate Limiting...');
  
  // Test login rate limiting
  console.log('   Testing login rate limiting...');
  let rateLimitHit = false;
  
  for (let i = 0; i < 6; i++) {
    const result = await makeRequest('POST', '/login', {
      email: 'rate@test.com',
      password: 'wrongpassword'
    });
    
    if (result.status === 429) {
      rateLimitHit = true;
      console.log('   ✅ Login rate limiting working');
      break;
    }
  }
  
  if (!rateLimitHit) {
    console.log('   ❌ Login rate limiting not working');
  }
  
  // Test registration rate limiting
  console.log('   Testing registration rate limiting...');
  rateLimitHit = false;
  
  for (let i = 0; i < 4; i++) {
    const result = await makeRequest('POST', '/register', {
      name: `Rate Test ${i}`,
      email: `rate${i}@test.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    });
    
    if (result.status === 429) {
      rateLimitHit = true;
      console.log('   ✅ Registration rate limiting working');
      break;
    }
  }
  
  if (!rateLimitHit) {
    console.log('   ❌ Registration rate limiting not working');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Authentication System Tests...');
  console.log('==========================================');
  
  try {
    await testRegistration();
    await testLogin();
    await testGetMe();
    await testUpdateProfile();
    await testChangePassword();
    await testForgotPassword();
    await testRefreshToken();
    await testGetUserStats();
    await testLogout();
    await testRateLimiting();
    
    console.log('\n🎉 All tests completed!');
    console.log('==========================================');
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testRegistration,
  testLogin,
  testGetMe,
  testUpdateProfile,
  testChangePassword,
  testForgotPassword,
  testRefreshToken,
  testGetUserStats,
  testLogout,
  testRateLimiting
}; 