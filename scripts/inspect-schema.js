const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log('Inspecting profiles table...');
    // Since RLS is disabled, we can try to select * from profiles limit 1
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.error('Error selecting profiles:', error);
    } else {
        console.log('Success. Row sample (keys):', data.length > 0 ? Object.keys(data[0]) : 'Table empty but accessible');
        if (data.length > 0) {
            console.log('Row:', data[0]);
        }
    }

    // Also check if we can insert a dummy row? No, need user ID.
}

inspect();
