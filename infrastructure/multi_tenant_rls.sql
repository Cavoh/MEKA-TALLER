-- SCRIPT SQL: AISLAMIENTO TOTAL (TENANT ISOLATION)
-- Basado únicamente en la asociación manual de perfiles en Supabase.

-- 1. Desactivar RLS temporalmente para limpieza
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY[
        'meka_tenants', 'meka_user_profiles', 'meka_clients', 
        'meka_inventory', 'meka_inventory_flow', 'meka_invoices', 
        'meka_maintenance', 'meka_personal', 'meka_roles', 
        'meka_shipping', 'meka_suppliers', 'meka_arqueos_caja',
        'meka_receivables', 'meka_receivable_payments', 
        'meka_payables', 'meka_payable_payments'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP 
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t); 
    END LOOP; 
END $$;

-- 2. Eliminar todas las políticas existentes en tablas meka_
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (
        SELECT policyname, tablename FROM pg_policies 
        WHERE schemaname = 'public' AND tablename LIKE 'meka_%'
    ) 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename); 
    END LOOP; 
END $$;

-- 3. Función Helper (Segura y simple con fallback por email)
DROP FUNCTION IF EXISTS public.get_my_tenant_id();
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.meka_user_profiles 
  WHERE user_id = auth.uid() 
     OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 4. Reactivar RLS
DO $$ 
DECLARE 
    t TEXT;
BEGIN 
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'meka_%') LOOP 
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t); 
    END LOOP; 
END $$;

-- 5. Aplicar políticas de aislamiento por tenant_id

-- MEKA_USER_PROFILES: Permite ver tu propio perfil (para que App.tsx cargue el tenant)
CREATE POLICY "Tenant_Profile_Select" ON public.meka_user_profiles 
FOR SELECT USING (user_id = auth.uid() OR LOWER(email) = LOWER(auth.jwt()->>'email'));

CREATE POLICY "Tenant_Profile_Update" ON public.meka_user_profiles 
FOR UPDATE USING (
  user_id = auth.uid() 
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
) WITH CHECK (user_id = auth.uid());

-- MEKA_TENANTS: Permite ver solo tu propio taller
CREATE POLICY "Tenant_Workshop_Select" ON public.meka_tenants 
FOR SELECT USING (id = public.get_my_tenant_id());

-- TODAS LAS DEMÁS TABLAS: Filtro estricto por tenant_id
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY[
        'meka_clients', 'meka_inventory', 'meka_inventory_flow', 'meka_invoices', 
        'meka_maintenance', 'meka_personal', 'meka_roles', 'meka_shipping', 
        'meka_suppliers', 'meka_arqueos_caja', 'meka_receivables', 
        'meka_receivable_payments', 'meka_payables', 'meka_payable_payments'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP 
        EXECUTE format('CREATE POLICY "Tenant_Op_Access" ON public.%I FOR ALL USING (tenant_id = public.get_my_tenant_id())', t);
    END LOOP; 
END $$;



