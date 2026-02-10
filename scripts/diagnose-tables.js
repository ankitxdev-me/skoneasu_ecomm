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

async function checkTable(tableName) {
    const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

    if (error) {
        return { exists: false, error: error.message, code: error.code };
    }
    return { exists: true, count };
}

async function diagnose() {
    console.log('Diagnosing Tables on:', supabaseUrl);

    const tables = ['products', 'categories', 'profiles', 'reviews', 'orders'];

    for (const table of tables) {
        const result = await checkTable(table);
        if (result.exists) {
            console.log(`[OK] Table "${table}" accessbile (Roles: ${result.count}).`);
        } else {
            console.error(`[FAIL] Table "${table}" error: ${result.error} (Code: ${result.code})`);
            if (result.code === '42P01') {
                console.error(`       -> This definitely means the table "${table}" DOES NOT EXIST.`);
            }
        }
    }
}

diagnose();
