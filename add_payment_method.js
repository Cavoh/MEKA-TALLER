const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno del archivo .env
const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL=')).split('=')[1].trim();
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=')[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAddPaymentMethod() {
  // Intentaremos insertar un registro temporal para ver si existe la columna
  // Como no podemos hacer ALTER TABLE directamente desde el cliente si no hay RPC
  // Le pediremos al usuario que corra el script en el SQL Editor de Supabase si no podemos.

  console.log('--- ACTUALIZACIÓN DE BASE DE DATOS REQUERIDA ---');
  console.log('Por favor, ejecuta el siguiente comando SQL en el SQL Editor de tu panel de Supabase:');
  console.log('\n');
  console.log(`
ALTER TABLE public.meka_invoices
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'Efectivo';
  `);
  console.log('\n');
  console.log('Esto añadirá el campo payment_method a las facturas, permitiendo filtrar por tipo de pago en el cierre de caja.');

}

checkAndAddPaymentMethod();
