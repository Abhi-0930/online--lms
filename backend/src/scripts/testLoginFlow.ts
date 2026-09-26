// Global fetch test suite

async function runTest() {
  console.log('=== STARTING AUTOMATED DEVICE LIMIT & SWITCHING TEST ===\n');

  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';

  // 1. Register on Device/Tab 1
  console.log('1. Registering account from Tab 1...');
  const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      fullName: 'Concurrency Test User',
      deviceId: 'tab-1-device',
      deviceName: 'Chrome Tab 1',
    }),
  });

  console.log('Register HTTP Status:', regRes.status);
  const regData: any = await regRes.json();
  const sessionToken1 = regData.sessionToken;
  const cookie1 = regRes.headers.get('set-cookie');
  console.log('Tab 1 sessionToken:', sessionToken1);
  if (regRes.status !== 201 && regRes.status !== 200) {
    throw new Error('Registration failed: ' + JSON.stringify(regData));
  }

  // 2. Attempt to login from Tab 2 without force
  console.log('\n2. Attempting login from Tab 2 without force (expecting 409 DEVICE_LIMIT_REACHED)...');
  const loginTab2Res = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      deviceId: 'tab-2-device',
      deviceName: 'Chrome Tab 2',
      force: false,
    }),
  });

  console.log('Tab 2 Login HTTP Status:', loginTab2Res.status);
  const loginTab2Data: any = await loginTab2Res.json();
  console.log('Tab 2 Login Response body:', loginTab2Data);

  if (loginTab2Res.status !== 409 || loginTab2Data.code !== 'DEVICE_LIMIT_REACHED') {
    throw new Error('Expected 409 DEVICE_LIMIT_REACHED but got: ' + loginTab2Res.status);
  }
  console.log('SUCCESS: Tab 2 received 409 DEVICE_LIMIT_REACHED with active device details!');

  // 3. User clicks "Switch to this Device" on Tab 2 (force: true)
  console.log('\n3. Clicking "Switch to this Device" on Tab 2 (force: true)...');
  const forceRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      deviceId: 'tab-2-device',
      deviceName: 'Chrome Tab 2',
      force: true,
    }),
  });

  console.log('Tab 2 Force Login HTTP Status:', forceRes.status);
  const forceData: any = await forceRes.json();
  const sessionToken2 = forceData.sessionToken;
  const cookie2 = forceRes.headers.get('set-cookie');
  console.log('Tab 2 new sessionToken:', sessionToken2);

  if (forceRes.status !== 200 || !sessionToken2) {
    throw new Error('Tab 2 force login failed: ' + JSON.stringify(forceData));
  }
  console.log('SUCCESS: Tab 2 logged in successfully!');

  // 4. Tab 1 sends heartbeat to /api/v1/auth/me with old session token
  console.log('\n4. Tab 1 sends heartbeat request with revoked session token...');
  const tab1MeRes = await fetch('http://localhost:4000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken1,
      Cookie: cookie1 || '',
    },
  });

  console.log('Tab 1 /auth/me HTTP Status (expecting 401):', tab1MeRes.status);
  const tab1MeData: any = await tab1MeRes.json();
  console.log('Tab 1 /auth/me Response body:', tab1MeData);

  if (tab1MeRes.status !== 401 || tab1MeData.code !== 'SESSION_REVOKED') {
    throw new Error('Expected 401 SESSION_REVOKED for Tab 1 but got: ' + tab1MeRes.status);
  }
  console.log('SUCCESS: Tab 1 was successfully revoked and received 401 SESSION_REVOKED!');

  // 5. Tab 2 sends heartbeat to /api/v1/auth/me with new session token
  console.log('\n5. Tab 2 sends heartbeat request with active session token...');
  const tab2MeRes = await fetch('http://localhost:4000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken2,
      Cookie: cookie2 || '',
    },
  });

  console.log('Tab 2 /auth/me HTTP Status (expecting 200):', tab2MeRes.status);
  const tab2MeData: any = await tab2MeRes.json();
  console.log('Tab 2 /auth/me User:', tab2MeData.user?.email);

  if (tab2MeRes.status !== 200 || !tab2MeData.user) {
    throw new Error('Expected 200 OK for Tab 2 but got: ' + tab2MeRes.status);
  }
  console.log('SUCCESS: Tab 2 is active, authenticated, and healthy on dashboard!');

  console.log('\n=== ALL TESTS PASSED PERFECTLY (5/5) ===');
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
