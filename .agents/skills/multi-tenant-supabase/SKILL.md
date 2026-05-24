---
name: Multi-Tenant Architecture with Supabase
description: A comprehensive guide on how to implement and interact with a multi-tenant SaaS architecture using Supabase RLS, tenant_ids, and RBAC.
---

# Multi-Tenant Architecture with Supabase

This skill defines the standard pattern for a multi-tenant application using Supabase. When creating or modifying features in a project that follows this architecture, you must strictly adhere to the following rules and patterns.

## Concept Overview

In a multi-tenant SaaS, a single database serves multiple independent businesses (tenants). Data isolation is paramount to ensure that a business can only see and modify its own data.

### 1. `tenant_id` on Every Table
Every operational table (except global configuration or shared dictionaries) MUST include a `tenant_id` UUID column.

```sql
ALTER TABLE public.table_name ADD COLUMN tenant_id UUID DEFAULT auth.uid();
CREATE INDEX idx_table_name_tenant ON public.table_name(tenant_id);
```

### 2. Políticas de Row Level Security (RLS)
En este proyecto, la seguridad no compara el `tenant_id` contra el `auth.uid()` directamente, sino contra el taller asignado en el perfil del usuario.

```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation Select" ON public.table_name FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM public.meka_user_profiles WHERE user_id = auth.uid()));
```

### 3. Gestión de Perfiles y Auto-vinculación
- **Descubrimiento**: Se permite que un usuario nuevo encuentre su perfil por email usando `auth.jwt()->>'email'`.
- **Vinculación**: Al primer login, el frontend (App.tsx) vincula el `auth.uid()` al perfil pre-existente.

## Agente Meka: Instrucciones Específicas
1. **Tablas Operativas (11)**: `meka_clients`, `meka_inventory`, `meka_inventory_flow`, `meka_invoices`, `meka_maintenance`, `meka_personal`, `meka_roles`, `meka_shipping`, `meka_suppliers`, `meka_tenants`, `meka_user_profiles`.
2. **Consultas Seguras**: Siempre incluye `.eq('tenant_id', tenantId)` en los servicios del frontend, aunque RLS esté activo, para mayor claridad y seguridad.
3. **Mantenimiento de RLS**: Nunca deshabilites RLS en producción. Si necesitas diagnosticar, usa scripts con el service_role de forma controlada.
