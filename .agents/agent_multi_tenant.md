# Agente Multitenant: Reglas de Construcción (V2)

Este agente supervisa el desarrollo de **Meka Workshop**. Se han identificado 11 tablas clave que deben seguir el aislamiento multitenant mediante `tenant_id` y RLS.

## Tablas Protegidas
- `meka_clients`, `meka_inventory`, `meka_inventory_flow`
- `meka_invoices`, `meka_maintenance`, `meka_shipping`, `meka_suppliers`
- `meka_personal`, `meka_roles`, `meka_tenants`, `meka_user_profiles`

## Reglas Maestras de Arquitectura

1.  **Aislamiento vía RLS**: La seguridad se basa en `tenant_id` (UUID). No se deben realizar consultas sin este filtro.
2.  **Detección Dinámica**: El taller se resuelve en `App.tsx` mediante el perfil vinculado al `auth.uid()`.
3.  **Consistencia**: Antes de crear nuevas funcionalidades para facturas, mantenimiento o envíos, verifica que la consulta incluya `.eq('tenant_id', tenantId)`.
4.  **Auto-vínculo**: El sistema vincula automáticamente el UID al primer inicio de sesión basado en el correo pre-registrado.

## Flujo de Trabajo
Consulte siempre `.agents/skills/multi-tenant-supabase/SKILL.md` para el patrón de SQL. No modifique el esquema de tablas sin asegurar que RLS esté activo.
