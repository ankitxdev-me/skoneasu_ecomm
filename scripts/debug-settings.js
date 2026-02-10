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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    console.log('Checking store_settings with ANON key...');
    const { data, error } = await supabase
        .from('store_settings')
        .select('*');

    if (error) {
        console.error('❌ Error fetching settings:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Settings found:', data);
        if (data.length === 0) {
            console.warn('⚠️ Table is empty!');
        }
    }
}

checkSettings();
