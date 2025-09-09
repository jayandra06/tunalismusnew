const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@tunalismus.com',
        password: 'admin@1234'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📄 Response data:', data);
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
      
      // Decode token to check contents
      try {
        const payload = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64').toString());
        console.log('👤 Token payload:', payload);
      } catch (e) {
        console.log('❌ Could not decode token:', e.message);
      }
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogin();
