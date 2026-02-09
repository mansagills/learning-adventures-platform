const fetch = require('node-fetch');

async function testNextAuthAPI() {
  console.log('🧪 Testing NextAuth API directly...\n');

  try {
    // Test 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('🔑 CSRF Token:', csrfData.csrfToken);

    // Test 2: Get providers
    console.log('\n2️⃣ Getting providers...');
    const providersResponse = await fetch(
      'http://localhost:3000/api/auth/providers'
    );
    const providersData = await providersResponse.json();
    console.log('📋 Available providers:');
    console.log(JSON.stringify(providersData, null, 2));

    // Test 3: Attempt login with credentials
    console.log('\n3️⃣ Attempting login...');
    const loginResponse = await fetch(
      'http://localhost:3000/api/auth/callback/credentials',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: 'student@test.com',
          password: 'password123',
          csrfToken: csrfData.csrfToken,
          callbackUrl: 'http://localhost:3000',
          json: 'true',
        }),
      }
    );

    console.log('📊 Login Response Status:', loginResponse.status);
    console.log('📊 Login Response Headers:');
    for (const [key, value] of loginResponse.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    const loginData = await loginResponse.text();
    console.log('📊 Login Response Body:', loginData);
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testNextAuthAPI();
