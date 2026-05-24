-- 1. Asegurar que las columnas de facturación existan en meka_tenants
ALTER TABLE meka_tenants 
ADD COLUMN IF NOT EXISTS invoice_prefix text DEFAULT 'FAC',
ADD COLUMN IF NOT EXISTS invoice_next_number integer DEFAULT 1;

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE meka_tenants ENABLE ROW LEVEL SECURITY;

-- 3. Crear una política para que los dueños/admin puedan actualizar su propio registro de taller
-- Primero borramos políticas viejas si existen para evitar conflictos
DROP POLICY IF EXISTS "Los administradores pueden actualizar su taller" ON meka_tenants;

CREATE POLICY "Los administradores pueden actualizar su taller" ON meka_tenants
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM meka_user_profiles WHERE tenant_id = meka_tenants.id AND role_id = 'admin'
    )
  );

-- 4. Permitir lectura para todos los usuarios del taller
DROP POLICY IF EXISTS "Los usuarios pueden ver su taller" ON meka_tenants;

CREATE POLICY "Los usuarios pueden ver su taller" ON meka_tenants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM meka_user_profiles WHERE tenant_id = meka_tenants.id
    )
  );
