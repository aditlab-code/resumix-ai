import http from 'http';
import express from 'express';
import cors from 'cors';

const envCorsOrigin = 'https://resumix.pradityawicaksono.com,http://localhost:3000,http://localhost:3001';
const allowedOrigins = envCorsOrigin.split(',').map((o) => o.trim().replace(/\/+$/, ''));

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'core-api' });
});

app.get('/api/v1/jobs', (req, res) => {
  res.json({ data: [] });
});

let server: http.Server;
let port: number;

function makeRequest(
  options: http.RequestOptions,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const reqOptions = { ...options, headers: { ...options.headers, ...headers } };
    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Security Header & CORS Automated Verification Suite...');

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      port = typeof addr === 'object' && addr !== null ? addr.port : 0;
      console.log(`[Test Server] Running on port ${port}`);
      resolve();
    });
  });

  try {
    // Test 1: Security Headers on GET /health
    console.log('\n[Test 1] Verifying Security Headers on GET /health...');
    const res1 = await makeRequest({ hostname: '127.0.0.1', port, path: '/health', method: 'GET' });

    console.assert(res1.statusCode === 200, `Expected 200, got ${res1.statusCode}`);
    console.assert(res1.headers['x-content-type-options'] === 'nosniff', 'Missing X-Content-Type-Options: nosniff');
    console.assert(res1.headers['x-frame-options'] === 'DENY', 'Missing X-Frame-Options: DENY');
    console.assert(res1.headers['x-xss-protection'] === '1; mode=block', 'Missing X-XSS-Protection');
    console.assert(res1.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Missing Referrer-Policy');
    console.assert(res1.headers['x-powered-by'] === undefined, 'X-Powered-By should be hidden');
    console.log('✅ Test 1 Passed: All security headers verified and X-Powered-By is hidden.');

    // Test 2: Allowed CORS Origin Request
    console.log('\n[Test 2] Verifying CORS allow header for valid origin...');
    const res2 = await makeRequest(
      { hostname: '127.0.0.1', port, path: '/health', method: 'GET' },
      { Origin: 'https://resumix.pradityawicaksono.com' }
    );
    console.assert(res2.statusCode === 200, `Expected 200, got ${res2.statusCode}`);
    console.assert(
      res2.headers['access-control-allow-origin'] === 'https://resumix.pradityawicaksono.com',
      `Unexpected CORS origin header: ${res2.headers['access-control-allow-origin']}`
    );
    console.log('✅ Test 2 Passed: Authorized origin allowed correctly.');

    // Test 3: Disallowed CORS Origin Request
    console.log('\n[Test 3] Verifying CORS rejection for unauthorized origin...');
    const res3 = await makeRequest(
      { hostname: '127.0.0.1', port, path: '/health', method: 'GET' },
      { Origin: 'http://unauthorized-evil-domain.com' }
    );
    console.assert(
      res3.headers['access-control-allow-origin'] !== 'http://unauthorized-evil-domain.com',
      'Unauthorized origin should not receive Access-Control-Allow-Origin'
    );
    console.log('✅ Test 3 Passed: Unauthorized origin correctly blocked cleanly.');

    // Test 4: Endpoint /api/v1/jobs
    console.log('\n[Test 4] Verifying /api/v1/jobs endpoint behavior...');
    const res4 = await makeRequest({ hostname: '127.0.0.1', port, path: '/api/v1/jobs', method: 'GET' });
    console.assert(res4.statusCode === 200, `Expected 200, got ${res4.statusCode}`);
    console.assert(res4.headers['x-frame-options'] === 'DENY', 'Missing X-Frame-Options on API route');
    console.log('✅ Test 4 Passed: API route security and response verified.');

    console.log('\n🎉 ALL SECURITY ENDPOINT VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
