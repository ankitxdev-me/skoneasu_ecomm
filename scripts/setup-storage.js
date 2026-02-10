const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env
try {
    const envPath = path.resolve(__dirname, '../.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            process.env[key] = value;
        }
    });
} catch (e) {
    console.log('Could not load .env file, relying on process.env');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try service role key first, then anon key (anon might fail for bucket creation)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('Setting up storage bucket: products');

    const { data, error } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket "products" already exists.');
        } else {
            console.error('Error creating bucket:', error);
        }
    } else {
        console.log('Bucket "products" created successfully:', data);
    }

    // Create policies? JS SDK doesn't support creating policies directly usually. 
    // Policies are SQL.
    // But if the bucket is public, reading is fine.
    // Writing requires authentication. 
    // If we can't run SQL easily, we might rely on the fact that locally defaults might differ?
    // Or hope that "public: true" is enough for reads, and authenticated users can write?
    // Actually, standard Supabase requires policies for ANY operation unless RLS is off?
    // Storage usually has RLS enabled by default.

    // If we can't create policies via JS, we revert to SQL?
    // But wait, `supabase db reset` runs migrations.
    // If I create a migration file in `supabase/migrations`, it will be applied.
    // That is the "correct" way.
    // But it involves resetting.

    // Let's try the bucket creation first. If policies act up, we'll see.
}

setupStorage();
