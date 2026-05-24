---
name: Arquitectura Global y Factorización de Meka Taller
description: LEYES SUPREMAS de la aplicación. Todo agente de Inteligencia Artificial que escriba código aquí DEBE leer y acatar estas reglas sin excepción para evitar la degradación de la calidad del código.
---

# LEYES DE ARQUITECTURA GLOBAL Y CÓDIGO LIMPIO

Meka Taller es un software SaaS Multi-tenant comercial con una calificación arquitectónica muy alta. Las siguientes reglas son innegociables para cualquier modificación, debug o refactor. Si un agente viola estas reglas, la calidad del proyecto se degrada y el agente habrá fallado en su tarea fundamental.

## 1. Mantenimiento del Feature-Sliced Design (Factorización)
- **Cero God Components**: Un componente NUNCA debe superar las 350-400 líneas sin una justificación de vida o muerte. Si estás arreglando un bug y el componente crece excesivamente, tu OBLIGACIÓN es extraer sub-componentes antes de cerrar la tarea.
- **Separación de Responsabilidades (SRP)**:
  - Las vistas (`JSX/TSX`) **solo** renderizan UI y conectan hooks.
  - La lógica de negocio y las llamadas a red (Supabase) deben residir **exclusivamente** en los servicios (`src/services/`).
  - El manejo del ciclo de vida y la caché de datos (React Query) debe residir **exclusivamente** en los Custom Hooks (`src/hooks/queries/`).
  - Los formularios y tablas van en componentes separados (`FormModal.tsx`, `Table.tsx`) en la misma carpeta del "Feature". No renderices modales gigantes en el mismo archivo del Tab.

## 2. Manejo Estricto de Paginación y Consultas de Servidor
- **Paginación Definitiva**: Es **ILEGAL** remover mecanismos de paginación o virtualización para "arreglar" un problema a lo rápido. Todo listado principal debe obtener sus datos usando un formato paginado: `(page_number, page_size) => { data: [], count: 0 }`.
- **Carga de Datos Eterna**: NUNCA reemplaces una paginación que viene por servidor con traer todos los elementos (`LIMIT 1000` indiscriminadamente) a memoria del navegador a menos que sean catálogos pequeños (categorías, etc.).

## 3. Manejo de Estado Global (Multitenancy Seguro)
- El entorno se maneja por medio del `WorkshopContext` (Tenant).
- Bajo NINGUNA circunstancia debes eliminar la validación del `tenant.id` antes de hacer una mutación o lectura en la base de datos (RLS). Si hay un bug de RLS, la solución no es enviar un payload vacío o bypasear la política en la UI; la solución es comprobar correctamente los JWT claims o pasar el tenant firmemente en los hooks.

## 4. Estilos y Consistencia Visual
- TailwindCSS se utiliza bajo variables globales estandarizadas (`bg-[var(--modal-bg)]` en lugar de `bg-white`). Respetar siempre el sistema de Theme dinámico (`index.css`).
- Al arreglar UI, no inyectes estilos en línea ni remuevas variables estandarizadas para usar colores arbitrarios.

## 5. Pruebas y Aislamiento Preventivo
- Si refactorizas lógica sensible, debes pensar a modo defensivo (Deep Defense):
  - Verifica opcionales antes de hacer un `.map()` (`array?.map` o `filter(Boolean)`).
  - Maneja los falsy-values que retornen las APIs.

> **NOTA PARA LA IA**: Si en la tarea actual dudas entre "resolver rápido ensuciando el código" o "tomarte pasos extra para separar el código y hacerlo lento pero limpio", la orden del usuario es clara: **ELIGE EL CÓDIGO LIMPIO Y SEPARADO SIEMPRE.** No importa si la refactorización te toma dos tool calls extra.
