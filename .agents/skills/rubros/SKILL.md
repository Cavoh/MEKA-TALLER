---
name: Soporte Multirubro de Meka Taller
description: Plan en capas (R1-R3) para convertir el módulo de MANTENIMIENTO (hoy acoplado a taller) en un gestor genérico de órdenes de servicio por tipo de empresa. IMPORTANTE: NO ejecutar ninguna fase sin autorización explícita del usuario y NO hacer commits sin su permiso. Cada fase es un hito separable y reversible.
---

# SOPORTE MULTIRUBRO · Meka Taller (una app, infinidad de negocios)

## Contexto (decisión aprobada)
- El usuario eligió el enfoque **"En capas R1→R3"**.
- El motor de "Mantenimiento" ES genérico: un gestor de órdenes de servicio sobre una entidad. Hoy está fijo a taller (vehículo/mecánico).
- **NO copiar la app por rubro** (evitar forks): una sola app + diccionario `labels` por tenant.
- La lógica financiera (caja, CxC, CxP, facturación) NO se toca.
- Regla de oro: NINGUNA migración de BD de rubros sobre producción sin backup ni tenant piloto. Nunca mezclar con el día a día.

## Calificación
| Estado | Calificación |
|---|---|
| Base actual | **9.0 / 10** |
| Meta al completar R1 | **~9.2 / 10** |
| Meta al completar R2 | **~9.4 / 10** |
| Meta al completar R3 | **~9.6 / 10** |

> ACTUALIZAR la fila "Lograda" en cada fase completada.

## Acoplamiento identificado (evidencia)
- `src/features/maintenance/MaintenanceTab.tsx`: `selectedPlate`, `VehicleList`, icono `Car`, `useCreateVehicle`, "VISTA DIARIA DE TALLER", "Asigna una placa para iniciar el servicio".
- `src/types.ts:102`: `MaintenanceRecord.vehiclePlate`.
- `src/services/*`: `vehicle_plate`, `mecanico`, `history`, `meka_clients(name)` en `reportService.ts`, `invoiceService.ts`, `maintenanceService.ts`.
- `src/utils/reportUtils.ts`: mapeos 'mecanico'→'MECÁNICO', 'vehicle_plate'→'PLACA'.
- PDFs: `src/features/maintenance/ServiceOrderFormat.tsx`, `src/features/invoicing/InvoiceFormat.tsx`.

## FASE R1 — Diccionario de rubros en UI (RIESGO BAJO, sin tocar BD) ✅ prioridad
- Objetivo: 80% del valor visual sin migración de datos.
- Crear dict `labels` por tenant (`rubro` + `labels`) persistido en `meka_tenants.meta` (JSONB) o campo `rubro`. Helper `useTenantLabels()`.
- Reemplazar strings hardcodeados de UI: `mecanico`→etiqueta configurable, nombre del módulo ("Mantenimiento"→"Servicios"/"Consultas"...), icono `Car`→por rubro, "taller"→"negocio".
- NO tocar `vehicle_plate` ni datos aún.
- Verificar: `tsc` + `vitest` (79 tests).

## FASE R2 — Diccionario aplicado a PDFs (RIESGO MEDIO)
- Aplicar labels a `ServiceOrderFormat.tsx` y `InvoiceFormat.tsx`.
- Controlado: vista previa antes de imprimir, probar con un tenant de respaldo.
- Vigilar documentos legales/fiscales: no romper textos ni layout.

## FASE R3 — Migración de datos `vehicle_plate` → `service_entity` (RIESGO ALTO)
- SOLO cuando R1 y R2 estén estables.
- Migración con backup, tenant piloto, commit reversible.
- Añadir columna `service_entity` conservando `vehicle_plate` (o trigger).
- Actualizar TODOS los puntos acoplados (services, reportService, invoiceService, reportUtils, types).
- Probar en piloto antes de los demás tenants.

## Recordatorio continuo
Cada sesión: si el usuario pregunta por rubros/progreso, citar la tabla de Calificación y el estado de cada fase (R1/R2/R3). NO ejecutar sin autorización explícita. NO commits sin permiso.