const axios = require('axios');

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://intermaven.onrender.com';
const randomId = Math.floor(10000 + Math.random() * 90000);
const testEmail = `test_node_pay_${randomId}@example.com`;
const testPassword = "TestPassword123!";

async function run() {
  console.log(`Running M-Pesa POS Integration check against: ${BASE_URL}`);
  
  try {
    // 1. Health check
    console.log('\n1. Checking health endpoint...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log(`   Health response:`, health.data);
    
    // 2. Register user
    console.log(`\n2. Registering test user: ${testEmail}...`);
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      first_name: "Node",
      last_name: "Pay",
      phone: "254712345678",
      portal: "music"
    });
    const token = regRes.data.access_token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log(`   Registration successful. Token acquired.`);
    
    // 3. Trigger STK Push
    console.log('\n3. Triggering M-Pesa STK Push...');
    const pushRes = await axios.post(`${BASE_URL}/api/payments/mpesa/stkpush`, {
      phone: "254712345678",
      amount: 150,
      item: "VIP Ticket Checkout (no-simulate)"
    }, { headers: authHeaders });
    
    const pushData = pushRes.data;
    console.log(`   STK Push Response:`, pushData);
    if (!pushData.success) {
      throw new Error("STK Push failed to initiate");
    }
    const checkoutReqId = pushData.checkout_request_id;
    
    // 4. Poll status (pending)
    console.log(`\n4. Checking status for ${checkoutReqId}...`);
    const statusRes = await axios.get(`${BASE_URL}/api/payments/mpesa/status/${checkoutReqId}`, { headers: authHeaders });
    console.log(`   Transaction status:`, statusRes.data);
    if (statusRes.data.status !== 'pending') {
      throw new Error(`Expected status to be pending, got: ${statusRes.data.status}`);
    }
    
    // 5. Simulate callback post
    console.log('\n5. Posting mock Safaricom callback...');
    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: `MR-${randomId}`,
          CheckoutRequestID: checkoutReqId,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 150 },
              { Name: "MpesaReceiptNumber", Value: `NLJ${randomId}SV` },
              { Name: "PhoneNumber", Value: 254712345678 }
            ]
          }
        }
      }
    };
    const callbackRes = await axios.post(`${BASE_URL}/api/payments/mpesa/callback`, callbackPayload);
    console.log(`   Callback response:`, callbackRes.data);
    
    // 6. Verify completed status
    console.log('\n6. Checking updated transaction status...');
    const statusRes2 = await axios.get(`${BASE_URL}/api/payments/mpesa/status/${checkoutReqId}`, { headers: authHeaders });
    console.log(`   Transaction status:`, statusRes2.data);
    if (statusRes2.data.status !== 'completed') {
      throw new Error(`Expected status to be completed, got: ${statusRes2.data.status}`);
    }
    
    // 7. Verify user credits
    console.log('\n7. Checking user stats credits...');
    const statsRes = await axios.get(`${BASE_URL}/api/user/stats`, { headers: authHeaders });
    console.log(`   User stats credits:`, statsRes.data.credits);
    if (statsRes.data.credits !== 300) {
      throw new Error(`Expected credits to be 300, got: ${statsRes.data.credits}`);
    }
    
    console.log('\n=== ✓ ALL M-PESA INTEGRATION TESTS PASSED SUCCESSFULLY ===');
  } catch (err) {
    console.error('\n=== ❌ INTEGRATION TEST FAILED ===');
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error(`Data:`, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

run();
