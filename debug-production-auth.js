/**
 * Production Authentication Debug Script
 * This script helps diagnose authentication issues in production
 */

// Test the production API directly
async function testProductionAuth() {
  console.log('🔍 Testing Production Authentication...');
  
  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('\n📡 Test 1: Basic API Access');
    const response = await fetch('https://tunalismus.in/api/trainer/batches', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 403) {
      console.log('❌ 403 Forbidden - Authentication issue confirmed');
      
      // Try to get more details
      try {
        const errorData = await response.json();
        console.log('Error Details:', errorData);
      } catch (e) {
        console.log('No JSON error response');
      }
    }
    
    // Test 2: Check if login endpoint works
    console.log('\n📡 Test 2: Login Endpoint');
    const loginResponse = await fetch('https://tunalismus.in/api/auth/signin', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Login Endpoint Status:', loginResponse.status);
    
    // Test 3: Check environment variables (if accessible)
    console.log('\n📡 Test 3: Environment Check');
    const envResponse = await fetch('https://tunalismus.in/api/health', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Health Check Status:', envResponse.status);
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Run the test
testProductionAuth();
