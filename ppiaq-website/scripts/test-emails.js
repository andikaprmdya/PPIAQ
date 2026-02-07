#!/usr/bin/env node

/**
 * Test Email Script
 *
 * Usage: node scripts/test-emails.js [email] [type]
 *
 * Examples:
 *   node scripts/test-emails.js andikapramudya30@gmail.com membership-pending
 *   node scripts/test-emails.js test@example.com membership-approved
 *   node scripts/test-emails.js test@example.com membership-rejected
 *   node scripts/test-emails.js test@example.com newsletter
 */

const http = require('http');

const email = process.argv[2] || 'andikapramudya30@gmail.com';
const type = process.argv[3] || 'membership-pending';
const baseUrl = 'http://localhost:3000';

const validTypes = ['membership-pending', 'membership-approved', 'membership-rejected', 'newsletter'];

if (!validTypes.includes(type)) {
  console.error(`❌ Invalid email type: ${type}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

console.log(`📧 Sending test email...`);
console.log(`   Type: ${type}`);
console.log(`   Email: ${email}`);
console.log('');

const data = JSON.stringify({ type, email });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test/send-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ Success!`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Message: ${result.message}`);
        console.log('');
        console.log('Response:');
        console.log(JSON.stringify(result.result || result, null, 2));
      } else {
        console.error(`❌ Error (${res.statusCode})`);
        console.error(`   ${result.error}`);
        if (result.details) {
          console.error(`   Details: ${result.details}`);
        }
      }
    } catch (e) {
      console.error('❌ Failed to parse response');
      console.error(responseData);
    }
    process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed');
  console.error(`   ${error.message}`);
  console.error('');
  console.error('Make sure the development server is running:');
  console.error('   npm run dev');
  process.exit(1);
});

req.write(data);
req.end();
