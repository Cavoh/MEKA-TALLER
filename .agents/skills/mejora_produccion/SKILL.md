---
name: Plan de Mejora a Producción de Meka Taller
description: Plan definitivo de prioridades funcionales para llevar Meka Taller a producción. IMPRESCINDIBLE leer este tracker SIEMPRE antes de continuar mejoras, para recordar la calificación meta, lo que falta por ejecutar y toda la calificación alcanzada. Úsalo ante preguntas de "¿qué falta?", "¿a cuánto estamos?" o "¿siguiente paso?".
---

# PLAN DEFINITIVO · Meka Taller → Producción

## Contexto (recordatorio clave)
- La paginación server-side YA está implementada en la app (inventario, clientes, mantenimiento usan `.range()` + `count: 'exact'`). **El punto crítico D1 ya está satisfecho. NO tocar listas.**
- La app está actualmente en **~8.5/10** por criterio funcional/profesional (no por estándares).
- Decisión del usuario: **NO** hacer cambios cosméticos (borrar `any`, <300 líneas, debounce, logo) porque son riesgo sin ganancia. Cambiar lo que funciona NO es prudente.

## Calificación META y runtime

| Estado | Calificación |
|---|---|
| **Base actual** | **8.5 / 10** |
| **Meta al completar Punto 1 + 2** | **≥ 9.0 / 10** |
| **Lograda (se actualiza al ejecutar)** | ★ **9.0 / 10** ✅ (Punto 1 y 2 completados) |

> REGLA: cada vez que se complete el Punto 1 y/o el Punto 2, ACTUALIZAR la fila "Lograda" de esta tabla y recalcular.

## Prioridades definitivas (solo lo necesario)

### PUNTO 1 — Credenciales a variables de entorno (SEGURIDAD REAL) 🔴 ✅ HECHO
- **Dónde**: `src/supabase.ts` (URL + anon key hardcodeadas).
- **Por qué importa**: cualquier persona con acceso al frontend compilado puede leer la URL y la anon key de la base de datos. Riesgo real.
- **Cómo**: mover a `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, crear `.env.local` (gitignored), documentar pasos en `.env.example`. Mantener `import.meta.env` accesible (buscaba TS env typing en `src/vite-env.d.ts`).
- **Impacto en calificación**: +0.3 → sube a ~8.8.

### PUNTO 2 — Proteger la lógica financiera con tests (DINERO) 🟠 ✅ HECHO
- **Dónde**: `src/services/reportService.ts` (usa `.neq('status','PAID')` en líneas ~241 y ~285). El test `reportService.db.test.ts` fue eliminado en el revert; la lógica financiera de caja/cuentas/arqueo quedó sin cobertura de test.
- **Por qué importa**: protege ventas, caja, CxC, CxP (dinero). Sin test, un bug en esa lógica no se detecta.
- **Cómo**: re-crear un test unitario que cubra `reportService.fetchUnifiedTransactions` y `fetchAnalytics` con mocks de `.eq/.neq`, y validar que `status != PAID` cumpla la regla. Inspirarse en `reportService.ts` y tests existentes (`cashServices.test.ts`, `accountsService.test.ts`).
- **Impacto en calificación**: +0.2 → sube a ~9.0.

## Orden de ejecución recomendado
1. **Punto 1** (seguridad indolora) → verificar `tsc` + `vitest`.
2. **Punto 2** (proteger dinero) → verificar `tsc` + `vitest`.
3. Actualizar calificación "Lograda" y dar commit profesional.

## Recordatorio continuo
Cada sesión: si el usuario pregunta por calificación/progreso/plan, **leer este archivo y citar la tabla "Calificación META y runtime"** antes de responder.