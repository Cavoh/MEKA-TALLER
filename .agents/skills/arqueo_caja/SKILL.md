---
name: Arqueo de Caja Multi-Método
description: Proceso completo conceptual, lógico y matemático para la entrega y arqueo de caja multi-métrica del módulo de VENTA DIARIA.
---
# Arqueo de Caja Multi-Método - Venta Diaria

El arqueo de caja es el proceso de cuadre y conciliación de turno donde ya no solo se mira el efectivo, sino las 5 billeteras/pasarelas principales: Efectivo, Tarjeta Débito, Tarjeta Crédito, Nequi, y Daviplata.

## 1. Etapas Core del Proceso

### A. Apertura de Caja (Inicio de Turno)
El punto de partida de un turno financiero, donde se digita el dinero disponible previamente en caja o en las pasarelas (Bases/Saldos Iniciales).
*   **Bases (Opening Balances):** Se capturan en un formulario las 5 variables: `apertura_efectivo`, `apertura_tarjeta_debito`, `apertura_tarjeta_credito`, `apertura_nequi`, y `apertura_daviplata`.
*   **Confirmación Dinámica:** Si algún valor es 0 o está vacío, el sistema debe preguntar: `¿Únicamente recibiste base de [CAMPOS RELLENADOS]?`. Esto obliga al usuario a validar su conteo antes de proceder.
*   **Experiencia de Campo:** Usar `onFocus select` para que el texto se resalte al entrar al campo, facilitando la sobreescritura inmediata.
*   **Reset al Cerrar:** Por seguridad y limpieza, todos los estados del modal de apertura deben borrarse (`setBases({ ...empty })`) si el modal se cierra por cualquier vía.
*   **Cierre por Backdrop:** El modal debe cerrarse al hacer clic en el fondo (fuera del área blanca).
*   **Estado:** Pasa a estado `abierta`.

### B. Registro de Transacciones (Ventas / Durante el Turno)
*   **Ventas Registradas:** Todas las facturas creadas entran con su respectivo `payment_type` explícito que matchea alguna de las 5 categorías.
*   **Acumulables de Sistema:** A lo largo del turno, el sistema calcula virtualmente `ventas_efectivo`, `ventas_tarjeta_debito`, `ventas_tarjeta_credito`, `ventas_nequi`, `ventas_daviplata` filtrando las facturas generadas.

### C. Proceso de Cuadre (Cierre Diario / Arqueo)
Alcanzado el final de la jornada, se muestra el balance y se le solicita al cajero digitar lo fisicamente contado.

#### 1. Cálculo del Total Esperado (Lo que el sistema dictamina)
Se debe mostrar en pantalla el consolidado Teórico general, pero desglosado en sus 5 casillas, que es la suma individual de:
> `Esperado [Medio] = Base [Medio] + Ventas [Medio]`

#### 2. Conteo Real (Físico declarado por el Cajero)
El usuario es forzado a digitar explícitamente cuánto billete o cuánta plata visualiza en las apps bancarias mediante 5 inputs numéricos:
> `cierre_efectivo`, `cierre_tarjeta_debito`, `cierre_tarjeta_credito`, `cierre_nequi`, `cierre_daviplata`

#### 3. Diferencia Global
Para simplificar la contabilidad general de sobrantes o faltantes se emite un cálculo único:
> `Diferencia Total = Suma(Cierres_Reales) - Suma(Esperados_Logicos)`

### D. Entrega y Cierre (Congelamiento)
*   Se guardan en `meka_arqueos_caja` las 15 variables mencionadas más la diferencia y las observaciones.
*   Se setea el estado `cerrada` y `fecha_cierre`. Las facturas viejas quedan amarradas indirectamente por el filtro de fecha/tiempo de este periodo.

## 2. Lineamientos Visuales (Dashboard de Arqueo)
- **Modal Apertura**: Diseño compacto de 2 columnas con ancho máximo `max-w-lg`.
- **Interacción**: Los campos deben permitir digitación fluida (no perder el foco). El cursor debe estar listo para escribir sin borrar manualmente.
- **Modal Cierre**: Pantalla híbrida. Mostrar "Esperado" global remarcado (Color Rojo/Rosado) y un desglose en cajas de las 5 clasificaciones, con sus correspondientes casillas de Input en la parte baja.
- El color de interfaz importa: Verde para Efectivo, Azul para Tarjetas, Morado para Nequi/Daviplata. Evita la confusión visual.

## 3. Modelo de Tabla (meka_arqueos_caja)
La tabla matriz unificada debe contener:
- `id`, `tenant_id`, `estado`, `fecha_apertura`, `fecha_cierre`, `usuario_id`
- 5 x `apertura_...`
- 5 x `ventas_...`
- 5 x `cierre_...`
- `diferencia_total`, `observaciones`
