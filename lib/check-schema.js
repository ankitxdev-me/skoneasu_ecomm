const { createClient } = require('@supabase/supabase-js');

// Hardcoded from .env
const supabaseUrl = 'https://ckuhiigwpjbnonvtuaav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdWhpaWd3cGpibm9udnR1YWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODQ1OTAsImV4cCI6MjA4NTQ2MDU5MH0.npMA2-PE8mCBQK5lCfRFBPjI6XqrCbjuMJlbmPaRVVk';

async function check() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking cart_items schema...');
    const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('id, variant_id')
        .limit(1);

    if (cartError) console.error('cart_items error:', cartError.message);
    else console.log('cart_items columns found. Sample:', cartData);

    console.log('Checking order_items schema...');
    const { data: orderData, error: orderError } = await supabase
        .from('order_items')
        .select('id, variant_id, variant_details')
        .limit(1);

    if (orderError) console.error('order_items error:', orderError.message);
    else console.log('order_items columns found. Sample:', orderData);
}

check();
