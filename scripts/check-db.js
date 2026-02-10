const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);


async function check() {
    console.log('Checking connection to:', supabaseUrl);

    // 1. Products only
    console.log('\n--- Test 1: Products Only ---');
    const { error: err1 } = await supabase.from('products').select('*').limit(1);
    if (err1) console.error('Error:', JSON.stringify(err1, null, 2));
    else console.log('Success');

    // 2. Products + Category
    console.log('\n--- Test 2: Products + Category ---');
    const { error: err2 } = await supabase.from('products').select('*, category:categories(id, name)').limit(1);
    if (err2) console.error('Error:', JSON.stringify(err2, null, 2));
    else console.log('Success');

    // 3. Products + Images
    console.log('\n--- Test 3: Products + Images ---');
    const { error: err3 } = await supabase.from('products').select('*, images:product_images(*)').limit(1);
    if (err3) console.error('Error:', JSON.stringify(err3, null, 2));
    else console.log('Success');

    // 4. Products + Variants
    console.log('\n--- Test 4: Products + Variants ---');
    const { error: err4 } = await supabase.from('products').select('*, variants:product_variants(*)').limit(1);
    if (err4) console.error('Error:', JSON.stringify(err4, null, 2));
    else console.log('Success');
}

check();
