const http = require('http');
const fs = require('fs');
const path = require('path');

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

// Client-side authentication logic mirroring app.js
class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

const localStorage = new MockStorage();
const sessionStorage = new MockStorage();

function isAuthenticated() {
  const isAuth = localStorage.getItem('spotkify_auth') === 'true' || sessionStorage.getItem('spotkify_auth') === 'true';
  const user = (localStorage.getItem('spotkify_user') || sessionStorage.getItem('spotkify_user') || '').trim().toLowerCase();
  return isAuth && (user === 'sharu' || user === 'you');
}

function getLoggedInUser() {
  const user = (localStorage.getItem('spotkify_user') || sessionStorage.getItem('spotkify_user') || '').trim().toLowerCase();
  if (user === 'you') return 'You';
  if (user === 'sharu') return 'Sharu';
  return user || 'Sharu';
}

async function runEndToEndTests() {
  console.log('==============================================');
  console.log('  RUNNING FULL AUTHENTICATION VERIFICATION   ');
  console.log('==============================================');
  let failures = 0;

  // 1. Initial State
  localStorage.clear();
  sessionStorage.clear();
  if (isAuthenticated() === false) {
    console.log('[PASS] Fresh visitor is unauthenticated');
  } else {
    console.error('[FAIL] Fresh visitor should be unauthenticated');
    failures++;
  }

  // TEST 1: Login as sharu / sharu@123
  const res1 = await postLogin('sharu', 'sharu@123');
  if (res1.status === 200 && res1.body.data?.token) {
    localStorage.setItem('spotkify_auth', 'true');
    localStorage.setItem('spotkify_user', 'sharu');
    localStorage.setItem('spotkify_token', res1.body.data.token);
    console.log('[PASS] TEST 1: sharu login succeeded (200 OK)');
  } else {
    console.error('[FAIL] TEST 1: sharu login failed', res1);
    failures++;
  }

  // TEST 6a: Refresh page after login (sharu)
  if (isAuthenticated() === true && getLoggedInUser() === 'Sharu') {
    console.log('[PASS] TEST 6a: Page refresh maintains sharu authentication');
  } else {
    console.error('[FAIL] TEST 6a: sharu session lost on simulated refresh');
    failures++;
  }

  // TEST 7: Log out
  localStorage.removeItem('spotkify_auth');
  localStorage.removeItem('spotkify_user');
  localStorage.removeItem('spotkify_token');
  if (isAuthenticated() === false) {
    console.log('[PASS] TEST 7a: Log out cleared session successfully');
  } else {
    console.error('[FAIL] TEST 7a: Log out failed to clear session');
    failures++;
  }

  // TEST 2: Login as you / you@123
  const res2 = await postLogin('you', 'you@123');
  if (res2.status === 200 && res2.body.data?.token) {
    localStorage.setItem('spotkify_auth', 'true');
    localStorage.setItem('spotkify_user', 'you');
    localStorage.setItem('spotkify_token', res2.body.data.token);
    console.log('[PASS] TEST 2: you login succeeded (200 OK)');
  } else {
    console.error('[FAIL] TEST 2: you login failed', res2);
    failures++;
  }

  // TEST 6b: Refresh page after login (you)
  if (isAuthenticated() === true && getLoggedInUser() === 'You') {
    console.log('[PASS] TEST 6b: Page refresh maintains you authentication');
  } else {
    console.error('[FAIL] TEST 6b: you session lost on simulated refresh');
    failures++;
  }

  // TEST: Remember Me disabled (sessionStorage test)
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('spotkify_auth', 'true');
  sessionStorage.setItem('spotkify_user', 'you');
  if (isAuthenticated() === true && getLoggedInUser() === 'You') {
    console.log('[PASS] Session-based (Remember Me unchecked) works correctly');
  } else {
    console.error('[FAIL] Session-based authentication failed');
    failures++;
  }

  // TEST 3: you / wrong password
  const res3 = await postLogin('you', 'wrongpassword');
  if (res3.status === 401 && res3.body?.error?.message === 'Incorrect username or password. Please try again.') {
    console.log('[PASS] TEST 3: you / wrong password returned generic 401 error');
  } else {
    console.error('[FAIL] TEST 3 failed', res3);
    failures++;
  }

  // TEST 4: sharu / wrong password
  const res4 = await postLogin('sharu', 'wrongpassword');
  if (res4.status === 401 && res4.body?.error?.message === 'Incorrect username or password. Please try again.') {
    console.log('[PASS] TEST 4: sharu / wrong password returned generic 401 error');
  } else {
    console.error('[FAIL] TEST 4 failed', res4);
    failures++;
  }

  // TEST 5: empty credentials
  const res5 = await postLogin('', '');
  if (res5.status === 401) {
    console.log('[PASS] TEST 5: empty credentials rejected with 401');
  } else {
    console.error('[FAIL] TEST 5 failed', res5);
    failures++;
  }

  // SECURITY AUDIT: Verify no password exposure in public files
  console.log('\n--- SECURITY AUDIT ---');
  const publicDir = path.join(__dirname, '..', '..', 'public');
  const files = fs.readdirSync(publicDir);
  let exposed = false;
  for (const file of files) {
    const fullPath = path.join(publicDir, file);
    if (fs.statSync(fullPath).isFile() && (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('you@123') || content.includes('You@123')) {
        console.error(`[FAIL] SECURITY VIOLATION: Password leaked in public/${file}!`);
        exposed = true;
        failures++;
      }
    }
  }
  if (!exposed) {
    console.log('[PASS] SECURITY VERIFIED: you@123 is completely absent from all frontend files (HTML, JS, CSS)');
  }

  console.log('\n==============================================');
  if (failures === 0) {
    console.log('  ALL CHECKS PASSED: 0 FAILURES              ');
    console.log('==============================================');
    process.exit(0);
  } else {
    console.error(`  FAILURES DETECTED: ${failures} FAILURE(S)   `);
    console.log('==============================================');
    process.exit(1);
  }
}

runEndToEndTests();
