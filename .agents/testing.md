# Agente de Testing: Guardián de la Calidad (Manual)

Este agente supervisa la implementación y ejecución de pruebas automatizadas para garantizar la estabilidad del **Proyecto**. Su foco principal es prevenir regresiones en lógica financiera y seguridad.

## Reglas Maestras de Testing

1.  **Lógica Primero**: Toda función de cálculo en los servicios (`src/services/`) **DEBE** tener una prueba unitaria correspondiente en `__tests__`.
2.  **Mocking de Supabase**: No realice llamadas reales a la base de datos durante las pruebas. Use mocks para simular las respuestas de `supabase-js`.
3.  **Tests de Auth y Roles (RBAC)**: Validar que los permisos (`hasActionPermission`) condicionen la UI. Específicamente, asegurar que los ítems con un `total > 0` queden inmutables (read-only y sin botones de basura) para roles sin privilegios como los mecánicos.
4.  **Tests de Filtros de Fechas (Extremos)**: Revisar siempre el comportamiento del UX cuando se combina una búsqueda de cliente y un filtro de fechas. La búsqueda de un cliente DEBE auto-expandir las fechas (`startOfYear`) para no ocultar métricas pasadas, pero manteniendo el control manual de los rangos si el usuario los altera. Adicionalmente, asegurar que los vehículos creados recientemente (historial vacío) no desaparezcan por efecto de los filtros de fechas activos.
5. **Paginación y Filtrado por Rango**: Validar que los listados masivos (Mantenimiento, Venta Diaria) usen `page/pageSize` y `.range()`. Los módulos operativos como FACTURAR y COMPRAS deben permanecer sin historial para garantizar una carga de 0ms.
6. **Prevención de Doble Envío (isSaving Guard)**: Todo formulario o proceso que genere registros en base de datos (facturas, compras, aperturas) **DEBE** implementar un estado `isSaving` que:
   - Al primer clic: establece `isSaving = true` y bloquea (`disabled`) todos los botones de acción.
   - Da feedback visual al usuario (opacidad reducida, texto cambiado a "GUARDANDO...").
   - Libera el bloqueo en un bloque `finally` para garantizar su reset incluso ante errores de red o DB.
   - Esta regla aplica a: `InvoicingTab`, `PurchasesTab`, `ClientsTab`, `InventoryTab`, `MaintenanceTab`, `PersonalTab`, `RolesTab`, `UsersTab`, `AperturaCajaModal`, `CierreCajaModal` y cualquier futuro módulo transaccional.
7. **Comportamiento de Modales Críticos**: Verificar en pruebas visuales/manuales que los modales (como Apertura de Caja) cierren por "Click Outside", no tengan focos bloqueantes y limpien sus estados al cerrarse.
8. **Nombrado de Archivos**: Los archivos de prueba deben seguir el patrón `nombre.test.ts` y ubicarse en carpetas `__tests__` cercanas al código que prueban.
9. **Cero Falsos Positivos**: Si una prueba falla, es una prioridad crítica arreglar la lógica o la prueba antes de subir cambios.

## Flujo de Trabajo

- Antes de modificar módulos con estados compartidos (ej. Filtros y Búsquedas simultáneas): Verifica el impacto colateral.
- Antes de modificar un cálculo financiero o bloqueo por Rol: Ejecuta los tests existentes.
- Después de la modificación: Actualiza o añade nuevos tests comprobando las nuevas limitantes impuestas.
- Revisa el skill correspondiente (`testing-app`) para ver ejemplos de configuración de Vitest.
