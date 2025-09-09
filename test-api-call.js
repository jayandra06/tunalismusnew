// Test script to check what the admin courses API returns
import fetch from 'node-fetch';

async function testApiCall() {
  try {
    console.log('🔄 Testing admin courses API...');
    
    const response = await fetch('http://localhost:3000/api/admin/courses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: No authentication headers - this should fail
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📋 Response body:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testApiCall();
