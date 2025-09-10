/**
 * Test Production APIs
 * This script tests if the production APIs are returning real data
 */

async function testProductionAPIs() {
  console.log('🔍 Testing Production APIs...');
  
  try {
    // Test 1: Health Check
    console.log('\n📡 Test 1: Health Check');
    const healthResponse = await fetch('https://tunalismus.in/api/health');
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthResponse.status);
    console.log('Health Data:', JSON.stringify(healthData, null, 2));
    
    // Test 2: Debug Session
    console.log('\n📡 Test 2: Debug Session');
    const sessionResponse = await fetch('https://tunalismus.in/api/debug-session');
    const sessionData = await sessionResponse.json();
    console.log('Session Status:', sessionResponse.status);
    console.log('Session Data:', JSON.stringify(sessionData, null, 2));
    
    // Test 3: Admin Stats (should return 401 if not logged in)
    console.log('\n📡 Test 3: Admin Stats (without auth)');
    const statsResponse = await fetch('https://tunalismus.in/api/admin/stats');
    console.log('Stats Status:', statsResponse.status);
    if (statsResponse.status === 401) {
      console.log('✅ Authentication is working - API correctly returns 401 for unauthenticated requests');
    } else {
      const statsData = await statsResponse.json();
      console.log('Stats Data:', JSON.stringify(statsData, null, 2));
    }
    
    // Test 4: Trainer Batches (should return 401 if not logged in)
    console.log('\n📡 Test 4: Trainer Batches (without auth)');
    const batchesResponse = await fetch('https://tunalismus.in/api/trainer/batches');
    console.log('Batches Status:', batchesResponse.status);
    if (batchesResponse.status === 401) {
      console.log('✅ Authentication is working - API correctly returns 401 for unauthenticated requests');
    } else {
      const batchesData = await batchesResponse.json();
      console.log('Batches Data:', JSON.stringify(batchesData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Run the test
testProductionAPIs();
