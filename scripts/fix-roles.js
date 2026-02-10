const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Config: List of emails that SHOULD be admins. All others will be demoted.
const ALLOWED_ADMINS = ['ankitgupta72724@gmail.com', 'nehagupt386@gmail.com'];

async function main() {
    try {
        // 1. Read .env file manually
        const envPath = path.resolve(__dirname, '../.env');
        let envContent = '';
        try {
            envContent = fs.readFileSync(envPath, 'utf8');
        } catch (e) {
            console.error('Could not read .env file', e);
            return;
        }

        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[match[1]] = value;
            }
        });

        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        // Note: To update other users, we technically need SERVICE_ROLE_KEY if RLS policies prevent it.
        // However, since "everyone is admin", the anon key *might* work if RLS allows admins to update others.
        // If this fails, we'll need the user to provide the Service Role Key or run SQL in dashboard.
        // Let's try with Anon key first, assuming the current user (if signed in context existed) could do it, 
        // but here we are a script. 
        // Actually, RLS usually blocks anonymous updates to 'role'.
        // If this script fails with RLS error, we will generate a SQL file for the user to run.

        // BUT checking the `fix-roles.js` context, we are running in a node process without a session. 
        // Unless we use SERVICE_ROLE_KEY, we are "anon".
        // We don't have SERVICE_ROLE_KEY in `.env` typically for frontend apps.
        // We will check if SUPABASE_SERVICE_ROLE_KEY is in env.

        const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        // If we only have anon key, this might fail if RLS is strict.

        console.log('Connecting to Supabase...');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log(`Enforcing admin whitelist: ${ALLOWED_ADMINS.join(', ')}`);

        // Fetch all admins
        const { data: admins, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('role', 'admin');

        if (fetchError) {
            console.error('Error fetching admins:', fetchError);
            return;
        }

        console.log(`Found ${admins.length} admins.`);

        for (const admin of admins) {
            if (!ALLOWED_ADMINS.includes(admin.email)) {
                console.log(`Demoting ${admin.email} (ID: ${admin.id}) to 'user'...`);

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'user' })
                    .eq('id', admin.id);

                if (updateError) {
                    console.error(`Failed to update ${admin.email}:`, updateError);
                } else {
                    console.log(`Successfully demoted ${admin.email}`);
                }
            } else {
                console.log(`Keeping ${admin.email} as admin.`);
            }
        }

        console.log('Done demoting.');

        // 2. Promote allowed admins
        console.log('Ensuring all allowed admins have correct role...');
        for (const email of ALLOWED_ADMINS) {
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, role')
                .eq('email', email)
                .single();

            if (profileError || !userProfile) {
                console.log(`User ${email} not found or error:`, profileError);
                continue;
            }

            if (userProfile.role !== 'admin') {
                console.log(`Promoting ${email} to admin...`);
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', userProfile.id);

                if (updateError) {
                    console.error(`Failed to promote ${email}:`, updateError);
                } else {
                    console.log(`Successfully promoted ${email}`);
                }
            } else {
                console.log(`${email} is already admin.`);
            }
        }

        console.log('All done.');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

main();
