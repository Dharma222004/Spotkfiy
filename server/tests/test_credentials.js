const http = require('http');

function postLogin(username, password) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ username, password });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4534,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getMe(token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4534,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING LOGIN CREDENTIAL TESTS ---');
  let allPassed = true;

  // TEST 1: sharu / sharu@123
  try {
    const res1 = await postLogin('sharu', 'sharu@123');
    const ok = res1.status === 200 && res1.body?.data?.token && res1.body?.data?.user?.userName === 'sharu';
    console.log(`TEST 1 (sharu / sharu@123): ${ok ? 'PASSED' : 'FAILED'} (status: ${res1.status})`);
    if (!ok) allPassed = false;

    // Verify /api/auth/me with sharu token
    if (ok) {
      const meRes = await getMe(res1.body.data.token);
      console.log(`  Token validation for sharu: ${meRes.status === 200 && meRes.body?.data?.userName === 'sharu' ? 'PASSED' : 'FAILED'}`);
    }
  } catch (err) {
    console.error('TEST 1 error:', err.message);
    allPassed = false;
  }

  // TEST 2: you / you@123
  try {
    const res2 = await postLogin('you', 'you@123');
    const ok = res2.status === 200 && res2.body?.data?.token && res2.body?.data?.user?.userName === 'you';
    console.log(`TEST 2 (you / you@123): ${ok ? 'PASSED' : 'FAILED'} (status: ${res2.status})`);
    if (!ok) allPassed = false;

    // Verify /api/auth/me with you token
    if (ok) {
      const meRes = await getMe(res2.body.data.token);
      console.log(`  Token validation for you: ${meRes.status === 200 && meRes.body?.data?.userName === 'you' ? 'PASSED' : 'FAILED'}`);
    }
  } catch (err) {
    console.error('TEST 2 error:', err.message);
    allPassed = false;
  }

  // TEST 3: you / wrong password
  try {
    const res3 = await postLogin('you', 'wrongpassword');
    const ok = res3.status === 401 && res3.body?.error?.message === 'Incorrect username or password. Please try again.';
    console.log(`TEST 3 (you / wrong password -> generic error): ${ok ? 'PASSED' : 'FAILED'} (status: ${res3.status})`);
    if (!ok) allPassed = false;
  } catch (err) {
    console.error('TEST 3 error:', err.message);
    allPassed = false;
  }

  // TEST 4: sharu / wrong password
  try {
    const res4 = await postLogin('sharu', 'wrongpassword');
    const ok = res4.status === 401 && res4.body?.error?.message === 'Incorrect username or password. Please try again.';
    console.log(`TEST 4 (sharu / wrong password -> generic error): ${ok ? 'PASSED' : 'FAILED'} (status: ${res4.status})`);
    if (!ok) allPassed = false;
  } catch (err) {
    console.error('TEST 4 error:', err.message);
    allPassed = false;
  }

  // TEST 5: empty username / password
  try {
    const res5 = await postLogin('', '');
    const ok = res5.status === 401;
    console.log(`TEST 5 (empty credentials -> fails): ${ok ? 'PASSED' : 'FAILED'} (status: ${res5.status})`);
    if (!ok) allPassed = false;
  } catch (err) {
    console.error('TEST 5 error:', err.message);
    allPassed = false;
  }

  // Non-existent user test: ensure no username enumeration
  try {
    const resNonExistent = await postLogin('nonexistentuser', 'somepassword');
    const ok = resNonExistent.status === 401 && resNonExistent.body?.error?.message === 'Incorrect username or password. Please try again.';
    console.log(`NO USER ENUMERATION TEST: ${ok ? 'PASSED' : 'FAILED'} (status: ${resNonExistent.status})`);
    if (!ok) allPassed = false;
  } catch (err) {
    console.error('Enumeration test error:', err.message);
    allPassed = false;
  }

  console.log('--- TEST SUMMARY ---');
  if (allPassed) {
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

// Wait a moment for server to be responsive
setTimeout(runTests, 1000);
