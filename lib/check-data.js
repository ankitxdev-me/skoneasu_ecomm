const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ckuhiigwpjbnonvtuaav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdWhpaWd3cGpibm9udnR1YWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODQ1OTAsImV4cCI6MjA4NTQ2MDU5MH0.npMA2-PE8mCBQK5lCfRFBPjI6XqrCbjuMJlbmPaRVVk';

async function check() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking product_variants data...');
    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .limit(10);

    if (error) console.error(error);
    else {
        console.log('Count:', data.length);
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

check();
