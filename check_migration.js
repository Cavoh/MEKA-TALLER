import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifmrmafdtlninrbwezdk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbXJtYWZkdGxuaW5yYndlemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzgxNjMsImV4cCI6MjA4MzU1NDE2M30.iDKgu8F0dleBZj0oSB7bdLzi4sMV5U0Bb-sqvEMQPsI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
    'meka_clients', 
    'meka_inventory', 
    'meka_inventory_flow', 
    'meka_invoices', 
    'meka_maintenance', 
    'meka_personal', 
    'meka_roles', 
    'meka_shipping', 
    'meka_suppliers'
];

const oldId = '00000000-0000-0000-0000-000000000000';
const newId = 'a80e068a-c67a-4381-895e-8b1d19065716';

async function check() {
    console.log('--- CONTEO POR TALLER ---');
    for (const t of tables) {
        const { count: oldCount } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('tenant_id', oldId);
        const { count: newCount } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('tenant_id', newId);
        console.log(`${t}: [Antiguo: ${oldCount}] [Actual: ${newCount}]`);
    }
}

check();
