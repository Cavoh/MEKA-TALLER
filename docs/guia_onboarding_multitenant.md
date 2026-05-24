# Guía de Onboarding Multitenant: Meka Workshop

## 1. Alta de Taller (SuperAdmin)
Desde la pestaña SuperAdmin, crea el taller y el perfil del dueño usando su **email real**. Esto crea un registro en `meka_user_profiles` con `user_id = null`.

## 2. Registro del Dueño
El dueño se registra en la App con el **mismo email**. Al entrar, `App.tsx` detectará el perfil y vinculará su cuenta automáticamente asignando el `uid` de Supabase al campo `user_id`.

## 3. Seguridad Automática
Una vez vinculado, todas las tablas (`meka_inventory`, `meka_invoices`, etc.) se filtrarán automáticamente por su `tenant_id` gracias a las políticas RLS.

---
**Nota**: Asegúrate de haber ejecutado `infrastructure/multi_tenant_rls.sql` en Supabase para activar el aislamiento.
