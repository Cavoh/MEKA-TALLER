
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifmrmafdtlninrbwezdk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbXJtYWZkdGxuaW5yYndlemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzgxNjMsImV4cCI6MjA4MzU1NDE2M30.iDKgu8F0dleBZj0oSB7bdLzi4sMV5U0Bb-sqvEMQPsI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnostic() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Check meka_roles
    console.log('\n1. Checking meka_roles:');
    const { data: roles, error: rolesError } = await supabase.from('meka_roles').select('*');
    if (rolesError) console.error('Error fetching meka_roles:', rolesError);
    else console.log('Found', roles.length, 'roles:', JSON.stringify(roles, null, 2));

    // 2. Check meka_tenants (to see what exists)
    console.log('\n2. Checking meka_tenants:');
    const { data: tenants, error: tenantsError } = await supabase.from('meka_tenants').select('*');
    if (tenantsError) console.error('Error fetching meka_tenants:', tenantsError);
    else console.log('Found', tenants.length, 'tenants:', JSON.stringify(tenants, null, 2));

    console.log('\n--- DIAGNOSTIC END ---');
}

diagnostic();
