const { createRazorpayOrder } = require('../lib/razorpay');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

async function testRazorpay() {
    console.log('Testing Razorpay keys...');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

    // Test Order Creation
    const result = await createRazorpayOrder(500, 'INR', 'test_receipt_001');

    if (result.success) {
        console.log('✅ Success! Order Created:', result);
    } else {
        console.error('❌ Failed:', result);
    }
}

testRazorpay();
