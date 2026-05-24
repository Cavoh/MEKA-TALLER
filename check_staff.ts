
import { supabase } from './src/supabase';

async function check() {
    const { data, error } = await supabase.from('meka_personal').select('nombre, contrasena');
    console.log(JSON.stringify(data, null, 2));
}
check();
