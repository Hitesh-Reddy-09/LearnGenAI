// Test script for frontend-backend authentication integration
// Run this with: node test-integration.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
  confirmPassword: 'TestPass123!'
};

const testCredentials = {
  email: 'test@example.com',
  password: 'TestPass123!'
};

let authToken = null;
let refreshToken = null;

// Utility function to log results
const logResult = (testName, success, message = '') => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${message ? `: ${message}` : ''}`);
};

// Test API connection
const testApiConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    logResult('API Connection', response.status === 200);
  } catch (error) {
    logResult('API Connection', false, error.message);
  }
};

// Test user registration
const testRegistration = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    if (response.data.success) {
      authToken = response.data.data.token;
      refreshToken = response.data.data.refreshToken;
      logResult('User Registration', true);
    } else {
      logResult('User Registration', false, response.data.message);
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      logResult('User Registration', true, 'User already exists (expected)');
    } else {
      logResult('User Registration', false, error.response?.data?.message || error.message);
    }
  }
};

// Test user login
const testLogin = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    if (response.data.success) {
      authToken = response.data.data.token;
      refreshToken = response.data.data.refreshToken;
      logResult('User Login', true);
    } else {
      logResult('User Login', false, response.data.message);
    }
  } catch (error) {
    logResult('User Login', false, error.response?.data?.message || error.message);
  }
};

// Test get current user
const testGetMe = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    if (response.data.success) {
      logResult('Get Current User', true);
      console.log('  User data:', {
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        role: response.data.data.user.role
      });
    } else {
      logResult('Get Current User', false, response.data.message);
    }
  } catch (error) {
    logResult('Get Current User', false, error.response?.data?.message || error.message);
  }
};

// Test token refresh
const testTokenRefresh = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    if (response.data.success) {
      authToken = response.data.data.token;
      refreshToken = response.data.data.refreshToken;
      logResult('Token Refresh', true);
    } else {
      logResult('Token Refresh', false, response.data.message);
    }
  } catch (error) {
    logResult('Token Refresh', false, error.response?.data?.message || error.message);
  }
};

// Test get user stats
const testGetUserStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/stats`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    if (response.data.success) {
      logResult('Get User Stats', true);
      console.log('  Stats:', response.data.data.stats);
    } else {
      logResult('Get User Stats', false, response.data.message);
    }
  } catch (error) {
    logResult('Get User Stats', false, error.response?.data?.message || error.message);
  }
};

// Test forgot password
const testForgotPassword = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: testUser.email
    });
    if (response.data.success) {
      logResult('Forgot Password', true);
    } else {
      logResult('Forgot Password', false, response.data.message);
    }
  } catch (error) {
    logResult('Forgot Password', false, error.response?.data?.message || error.message);
  }
};

// Test logout
const testLogout = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    if (response.data.success) {
      logResult('User Logout', true);
    } else {
      logResult('User Logout', false, response.data.message);
    }
  } catch (error) {
    logResult('User Logout', false, error.response?.data?.message || error.message);
  }
};

// Test unauthorized access
const testUnauthorizedAccess = async () => {
  try {
    await axios.get(`${API_BASE_URL}/auth/me`);
    logResult('Unauthorized Access', false, 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logResult('Unauthorized Access', true, 'Correctly blocked');
    } else {
      logResult('Unauthorized Access', false, error.response?.data?.message || error.message);
    }
  }
};

// Test invalid token
const testInvalidToken = async () => {
  try {
    await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });
    logResult('Invalid Token', false, 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logResult('Invalid Token', true, 'Correctly blocked');
    } else {
      logResult('Invalid Token', false, error.response?.data?.message || error.message);
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🧪 Testing Frontend-Backend Authentication Integration\n');
  
  // Test API connection first
  await testApiConnection();
  
  // Test authentication flow
  await testRegistration();
  await testLogin();
  await testGetMe();
  await testTokenRefresh();
  await testGetUserStats();
  await testForgotPassword();
  await testLogout();
  
  // Test security
  await testUnauthorizedAccess();
  await testInvalidToken();
  
  console.log('\n🎉 Integration tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Start the backend server: cd backend && npm start');
  console.log('2. Start the frontend: cd frontend && npm run dev');
  console.log('3. Test the UI authentication flow');
  console.log('4. Check that protected routes work correctly');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testUser,
  testCredentials
}; 