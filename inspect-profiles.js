const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ckuhiigwpjbnonvtuaav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdWhpaWd3cGpibm9udnR1YWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODQ1OTAsImV4cCI6MjA4NTQ2MDU5MH0.npMA2-PE8mCBQK5lCfRFBPjI6XqrCbjuMJlbmPaRVVk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    console.log('Fetching profiles...');
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role');

    if (error) {
        console.error('Error fetching profiles:', error);
        fs.writeFileSync('profiles.json', JSON.stringify({ error }, null, 2));
    } else {
        fs.writeFileSync('profiles.json', JSON.stringify(data, null, 2));
        console.log('Profiles written to profiles.json');
    }
}

inspectProfiles();
