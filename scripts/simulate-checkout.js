const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateCheckoutLogic() {
    console.log('Simulating Checkout Page Logic...');
    let shippingFee = 70; // Default
    let freeShippingThreshold = 999; // Default

    const { data } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', ['shipping_fee', 'free_shipping_threshold'])

    console.log('Raw Data from Supabase:', data);

    if (data) {
        data.forEach(item => {
            console.log(`Processing item: Key=${item.key}, Value=${item.value}, Type=${typeof item.value}`);
            if (item.key === 'shipping_fee') shippingFee = Number(item.value);
            if (item.key === 'free_shipping_threshold') freeShippingThreshold = Number(item.value);
        })
    }

    console.log('Resolved Settings:');
    console.log('Shipping Fee:', shippingFee);
    console.log('Free Shipping Threshold:', freeShippingThreshold);

    const cartTotal = 500;
    const isFree = cartTotal >= freeShippingThreshold;
    console.log(`Cart Total: ${cartTotal}. Is Free? ${isFree}`);
    console.log('Applied Shipping:', isFree ? 0 : shippingFee);
}

simulateCheckoutLogic();
