const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, 'migrations', 'add_search_function.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL from:', sqlPath);
        await client.query(sql);

        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
