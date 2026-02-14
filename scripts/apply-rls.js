const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
    try {
        // Read .env to get DATABASE_URL
        const envPath = path.resolve(__dirname, '../.env');
        let envContent = '';
        try {
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
            }
            const localEnvPath = path.resolve(__dirname, '../.env.local');
            if (fs.existsSync(localEnvPath)) {
                envContent += '\n' + fs.readFileSync(localEnvPath, 'utf8');
            }
        } catch (e) {
            console.error('Could not read .env file', e);
            process.exit(1);
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

        const connectionString = env.DATABASE_URL || env.POSTGRES_URL;

        if (!connectionString) {
            console.error('DATABASE_URL or POSTGRES_URL not found in .env');
            console.log('Please run the SQL manually.');
            process.exit(1);
        }

        const client = new Client({
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false } // Supabase requires SSL, usually self-signed or CA is fine
        });

        console.log('Connecting to database...');
        await client.connect();

        const sqlPath = path.resolve(__dirname, '../lib/fix-review-rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);

        console.log('Successfully applied RLS policies.');
        await client.end();

    } catch (error) {
        console.error('Error executing script:', error);
        process.exit(1);
    }
}

main();
