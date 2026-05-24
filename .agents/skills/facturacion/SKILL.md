---
name: Facturacion (Invoicing) Module
description: Guía de interacción, arquitecturas lógicas y comportamiento interno del módulo de Facturación.
---

# Módulo de Facturación (Invoicing)

Este **Skill** detalla la lógica de negocio, manejo de estado y componentes del módulo de Facturación en `src/features/invoicing`. Está diseñado para proveer a los agentes un manual detallado as-is para inspección o debugging sin alterar el código existente.

## Entidades y Tipos Principales

- **InvoiceItem**: Estructura de los productos/servicios a facturar (`description`, `quantity`, `price`, `discount`, `iva`, `total`).
- **Client**: Entidad de cliente.
- **Factura (payload)**: Consolidado de estado.

## Comportamiento del Botón: "EMITIR FACTURA" (`handleSaveInvoice`)

1. **Punto de Entrada**: Al presionar pre-guardar, se abre el Modal de "FORMA DE PAGO" (`showPaymentModal`), disparando `handleSaveInvoice(method)`.
2. **Validaciones Estrictas**:
   - `cajaAbierta`: Debe existir una sesión de caja activa devuelta por `useCurrentCashRegister` para poder facturar, de lo contrario se muestra error.
   - `selectedClient` o `isNewClientForm`: Se detiene y exige un cliente válido o crear uno.
   - Al menos 1 ítem con `description` no vacía.
3. **Cálculo de Totales (`calculateTotals`)**:
   - `Subtotal` = Base de cantidad * precio de cada ítem.
   - `Descuento` = Calculado a partir de la base.
   - `IVA` = Aplicado a la *base con descuento*.
4. **Mutación de Guardado**:
   - Llama a `saveInvoiceMutation.mutateAsync({...})` y procesa todo en Supabase o el backend correspondiente.
5. **Impresión Física (Recibo)**:
   - Se llena el estado `printSnapshot` con los datos calculados.
   - Tras 500ms (`setTimeout`), se invoca la API del navegador `window.print()`.
   - Inmediatamente se reinicia el formulario (`setIsNewClientForm(false)`, vaciar carrito de ítems a 1).

## Componentes Acoplados

- `InvoiceClientSection`: Manejo de búsqueda de clientes y autocompletado desde módulos de mantenimiento (`handleLoadFromModule`).
- `InvoiceSummary`: Vista resumen lateral y botón de pre-guardar.
- `InvoiceItemTable`: Tabla interactiva para modificar o eliminar ítems.
- `InvoiceFormat`: Esqueleto del diseño físico para la impresora térmica/convencional, oculto hasta la impresión.
