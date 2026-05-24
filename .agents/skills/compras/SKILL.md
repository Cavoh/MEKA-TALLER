---
name: Compras (Purchases) Module
description: Guía de interacción, lógicas de ingreso al inventario y manejo de proveedores del módulo de Compras.
---

# Módulo de Compras (Purchases)

Este **Skill** detalla la lógica de negocio, manejo de estado y componentes del módulo de Compras (`src/features/purchases`). Describe paso a paso cómo se registran compras y cómo interactúan con el inventario sin modificar su código subyacente.

## Entidades y Tipos Principales

- **InvoiceItem**: Reutilizado con estructura de compras para los elementos importados/adquiridos.
- **Supplier**: Entidad de proveedor, fundamental para las facturas de adquisición.
- **Compra (Shipping Payload)**: Consolidado y control del documento de la compra que incrementa base.

## Comportamiento del Botón: "GUARDAR COMPRA" (`handlePrintAndSave`)

1. **Punto de Entrada**: Al presionar pre-guardar, si no existen inconsistencias, se detona `handlePrintAndSave` pasándole el método de pago elegido.
2. **Validaciones**:
   - Se ignora la caja chica para compras por defecto, pero se requiere al menos un ítem con descripción o con un **SKU**.
   - Se audita al `selectedSupplier` o una forma de registro activa (`isNewSupplierForm`). 
3. **Control Mutacional con Proveedor**:
   - Si se trata de un nuevo proveedor (`isNewSupplierForm`), primero se dispara de manera asíncrona `createSupplierMutation` para validarlo y obtener su ID.
4. **Ejecución del Guardado**:
   - Los datos se pasan a `savePurchaseMutation.mutateAsync()`, en la que el backend/Supabase asocia los importes (resta si es compra de inventario).
   - El precio es un precio de *COSTO*, a diferencia de facturación.
5. **Impresión Rápida de Comprobante**:
   - Similar al diseño de Invoicing, genera `printSnapshot` y en 500ms dispara `window.print()` renderizando `InvoiceFormat` oculto.
   - Resetea el listado a un solo ítem en blanco y vacía datos del proveedor.

## Componentes Compartidos

- `PurchaseFormTable`: Renderiza inputs especiales orientados al coste, y no venta.
- `InvoiceFormat`: Comparte el formato de factura, pero adaptado para imprimir el concepto de 'comprobante de ingreso' cuando es compra de materiales.
