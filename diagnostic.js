import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifmrmafdtlninrbwezdk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbXJtYWZkdGxuaW5yYndlemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzgxNjMsImV4cCI6MjA4MzU1NDE2M30.iDKgu8F0dleBZj0oSB7bdLzi4sMV5U0Bb-sqvEMQPsI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- PERFILES EN DB ---');
    const { data: profiles, error: pError } = await supabase.from('meka_user_profiles').select('*');
    if (pError) console.error(pError);
    else console.table(profiles);

    console.log('\n--- TALLERES EN DB ---');
    const { data: tenants, error: tError } = await supabase.from('meka_tenants').select('id, name');
    if (tError) console.error(tError);
    else console.table(tenants);
    
    console.log('\n--- SESIÓN ACTUAL ---');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('User ID:', session?.user?.id);
    console.log('User Email:', session?.user?.email);
}

check();
