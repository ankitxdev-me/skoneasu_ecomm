const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^["'](.*)["']$/, '$1');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching categories...');
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }

    console.log('Total categories:', data.length);
    const mainCategories = data.filter(c => c.is_main);
    console.log('Main categories count:', mainCategories.length);

    // Log all categories to see if is_main exists
    if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('All categories:', data.map(c => ({ name: c.name, is_main: c.is_main })));
    }
}

main();
