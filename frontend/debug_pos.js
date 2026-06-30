const axios = require('axios');

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://intermaven.onrender.com';
const randomId = Math.floor(10000 + Math.random() * 90000);
const testEmail = `test_debug_pos_${randomId}@example.com`;
const testPassword = "TestPassword123!";

async function run() {
  try {
    console.log(`Diagnostic POS check against: ${BASE_URL}`);
    
    console.log('1. Registering user...');
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      first_name: "Debug",
      last_name: "POS",
      phone: "254712345678",
      portal: "music"
    });
    const token = regRes.data.access_token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    console.log('2. Triggering STK Push...');
    const startTime = Date.now();
    const pushRes = await axios.post(`${BASE_URL}/api/payments/mpesa/stkpush`, {
      phone: "254712345678",
      amount: 150,
      item: "Debug Ticket"
    }, { headers: authHeaders });
    const checkoutReqId = pushRes.data.checkout_request_id;
    console.log(`   Initiated in ${Date.now() - startTime}ms. checkout_request_id: ${checkoutReqId}`);

    console.log('3. Fetching transactions list immediately...');
    const listRes = await axios.get(`${BASE_URL}/api/payments/transactions`, { headers: authHeaders });
    console.log('   Transactions:', JSON.stringify(listRes.data.transactions, null, 2));

    console.log('4. Polling status for 10 seconds...');
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await axios.get(`${BASE_URL}/api/payments/mpesa/status/${checkoutReqId}`, { headers: authHeaders });
      console.log(`   Poll #${i} (after ${i*2}s): status = ${statusRes.data.status}`);
    }

  } catch (err) {
    console.error(err);
  }
}

run();
