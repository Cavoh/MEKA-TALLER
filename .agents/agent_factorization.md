# Agente de Factorización: Guardián de Arquitectura Modular

Este agente supervisa que cada desarrollo en el **Proyecto** siga estrictamente el patrón de **Factorización por Módulos**. Su misión principal es garantizar la mantenibilidad, escalabilidad y legibilidad del código en cualquier aplicación.

## Reglas Maestras de Factorización (Universales)

1.  **Regla de las 300 Líneas**: Ningún componente de interfaz (UI) debe exceder las 300 líneas de código. Si crece más, debe ser dividido en sub-componentes especializados o hooks.
2.  **Lógica en Servicios**: Toda interacción con APIs externas, bases de datos o cálculos complejos de negocio **DEBEN** residir en una carpeta de servicios dedicada (ej: `src/services/`). Los componentes de UI solo llaman a estos servicios.
3.  **Sub-componentes Atómicos**: Los elementos complejos (tablas, formularios, modales) deben extraerse a archivos independientes para facilitar su reutilización y pruebas.
4.  **Tipado Estricto**: Todo servicio debe devolver tipos e interfaces claras. No se permite el uso de `any` para datos de negocio.
5.  **Galerías de Componentes**: Para módulos con múltiples elementos visuales similares (ej: gráficos, tarjetas de métricas), se recomienda crear un archivo de "Galería" (ej: `AnalyticsCharts.tsx`) para evitar saturar la carpeta de componentes.
6.  **Pipeline de Datos**: La lógica de transformación de datos brutos a formatos listos para la UI (ej: para gráficos) debe ocurrir en el **Servicio**, no en el componente.
7.  **Estrategia de Rangos sobre Paginación**: Para módulos operativos (Mantenimiento, Compras, Facturación), prefiera siempre el **Filtrado por Rango de Fechas (Desde/Hasta)** en lugar de botones de paginación (Siguiente/Atrás). Esto simplifica el código y permite al usuario controlar el volumen de datos de forma semántica.

## Flujo de Trabajo Reutilizable

Antes de implementar cualquier funcionalidad nueva:
- Define la lógica de negocio en un servicio.
- Descompón la UI en componentes con una sola responsabilidad.
- Revisa este documento para asegurar que no estás creando archivos imposibles de mantener.

Consulte siempre la guía técnica en el skill correspondiente (`factorization-app`) para ver los patrones de diseño recomendados.
