const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('--- .env content check (masked) ---');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && key.trim() === 'RAZORPAY_KEY_SECRET') {
        console.log('RAZORPAY_KEY_SECRET is present.');
        console.log('Length:', value ? value.trim().length : 0);
        console.log('Value (first 3 chars):', value ? value.trim().substring(0, 3) : 'N/A');
    }
});
