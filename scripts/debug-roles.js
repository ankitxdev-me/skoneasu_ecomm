const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials in .env');
            return;
        }

        console.log('Connecting to Supabase...');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Check role distribution
        console.log('Checking role distribution in profiles table...');
        const { data: profiles, error: roleError } = await supabase
            .from('profiles')
            .select('role');

        if (roleError) {
            fs.writeFileSync(path.resolve(__dirname, 'debug-output.txt'), `Error fetching profiles: ${JSON.stringify(roleError)}`);
            return;
        }

        if (!profiles) {
            fs.writeFileSync(path.resolve(__dirname, 'debug-output.txt'), "No profiles found.");
            return;
        }

        const distribution = profiles.reduce((acc, curr) => {
            const role = curr.role || 'null';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        const output = `Role Distribution: ${JSON.stringify(distribution, null, 2)}\n\n`;

        // 3. List first 10 admins
        const { data: admins, error: adminError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('role', 'admin')
            .limit(10);

        let adminOutput = '';
        if (adminError) {
            adminOutput = `Error fetching admins: ${JSON.stringify(adminError)}`;
        } else {
            adminOutput = `Sample Admins:\n${JSON.stringify(admins, null, 2)}`;
        }

        // 4. List first 5 users
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .neq('role', 'admin')
            .limit(5);

        let userOutput = '';
        if (userError) {
            userOutput = `Error fetching users: ${JSON.stringify(userError)}`;
        } else {
            userOutput = `Sample Non-Admins:\n${JSON.stringify(users, null, 2)}`;
        }

        fs.writeFileSync(path.resolve(__dirname, 'debug-output.txt'), output + adminOutput + '\n\n' + userOutput);
        console.log('Output written to debug-output.txt');

    } catch (error) {
        const errOutput = `Unexpected error: ${error}\n${error.stack}`;
        fs.writeFileSync(path.resolve(__dirname, 'debug-output.txt'), errOutput);
        console.error(error);
    }
}

main();
