# Skill: Sistema de Testing Profesional (testing-app)

Esta guía establece el estándar para escribir pruebas rápidas, confiables y útiles utilizando **Vitest**.

## 1. Configuración de Vitest

El proyecto utiliza Vitest para una integración perfecta con Vite. Los tests se ejecutan con:
```bash
npm test
```

## 2. Mocking de Supabase (Patrón Recomendado)

Para probar servicios sin tocar la base de datos real:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { supabase } from '../supabase';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));
```

## 3. Pruebas de Lógica Financiera

Los cálculos de facturación son el corazón de la app. Asegúrese de probar:
- **Totales**: (Cantidad * Precio) - Descuento + IVA.
- **Redondeo**: Asegurar precisión en decimales si aplica.
- **Cascada**: Que al cambiar un precio o descuento, el total final se recalcule correctamente.

## 4. Pruebas de Roles y Permisos (RBAC)

El sistema utiliza roles granulares (`hasActionPermission`). Asegúrese de probar las restricciones de UI y lógica de negocio:
- **Mecánicos vs Admins**: Verificar que roles sin `ACTION_EDITAR_ITEMS` se les deshabiliten los inputs (cantidad, descripción, precio) una vez la línea obtiene un valor total (`total > 0`).
- **Bloqueo Visual vs Lógico**: Confirmar que los botones de eliminar (Trash) tampoco rendericen para roles sin permisos en ítems ya valorados.

## 5. Pruebas de Filtros de Fechas (Time-range Filtering)

Al probar flujos de búsqueda y visualización diaria (ej. `MaintenanceTab`), cubra estos casos críticos:
- **Vista Diaria (General)**: El filtro "Desde/Hasta" debe ocultar los vehículos sin historia en ese rango, EXCEPTO los recién creados (`history.length === 0`).
- **Vista de Cliente (Específica)**: Al buscar un cliente, el UI debe **auto-expandir** el `dateFrom` al inicio del año (`startOfYear`) para mostrar todo su historial predeterminado, sin que los filtros oculten módulos recientes.

## 6. Checklist de Calidad Técnica
- [ ] ¿El test cubre los casos borde (ej: cantidad 0, descuento 100%, vehículo nuevo sin módulos)?
- [ ] ¿Se validan explícitamente los bloqueos de inputs para roles restrictivos (Mecánico)?
- [ ] ¿Se están mockeando las dependencias externas (APIs y Supabase)?
- [ ] ¿El test es independiente y no depende de otros tests?
- [ ] ¿Los nombres de los tests son descriptivos (en inglés o español)?

Siga estos principios para que el proyecto sea robusto y escalable sin miedo a romper funcionalidades clave de negocio ni seguridad de roles.
