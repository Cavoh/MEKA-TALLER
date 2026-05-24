---
name: Dynamic UI Theming System (Appearance & Accent)
description: A generic implementation guide for a multi-layered UI theming system featuring dynamic Visual Styles (Light, Gray, Dark) and Accent Colors (Indigo, Emerald, Red, Gray).
---

# Dynamic UI Theming System

This skill defines the standard pattern for implementing a customizable user interface based on two distinct layers: **Visual Style** (backgrounds/surfaces) and **Color de Énfasis** (primary actions/highlights).

This exact pattern is implemented in `MEKA-TALLER` to maintain a cohesive and premium aesthetic.

## 1. Dimensiones del Sistema (Dos Ejes Independientes)

El sistema permite combinar cualquier **Fondo** con cualquier **Color de Énfasis**.

### A. Estilo Visual (Fondos / Superficies)
Controla el fondo global, colores de texto y bordes.
*   **light (CLARO):** White backgrounds, dark text, light gray borders. Ideal for daytime or well-lit environments.
*   **gray (GRIS):** Soft gray backgrounds (`slate` or `zinc`), slightly muted text. Reduces eye strain while remaining bright.
*   **dark (OSCURO):** Deep dark backgrounds (`gray-900` or `#0f172a`), light text, subtle dark borders. Ideal for low-light environments.

### B. Color de Énfasis (Paleta de Colores)
Controla la identidad de marca, estados activos, botones principales y destacados. Funciona dinámicamente sobre cualquier fondo elegido.
*   **indigo (ÍNDIGO):** A vibrant, trustworthy blue-purple.
*   **esmeralda (ESMERALDA):** A positive, energetic green.
*   **rojo (ROJO):** An urgent, bold rose red.
*   **gris (GRIS):** A neutral, muted tone for a strictly minimalist interface.

---

## 2. Implementation Pattern

### State Management
The application maintains the user's preference globally using React state and persists it to `localStorage` and `meka_user_profiles` table.

```typescript
// Current implementation pattern
interface AppearanceState {
  theme: 'light' | 'gray' | 'dark';
  emphasisColor: 'indigo' | 'esmeralda' | 'rojo' | 'gris';
}
```

### HTML Attribute Injection
The selected theme and emphasis are injected as attributes on the root `<html>` tag for robust CSS selection.

```typescript
document.documentElement.setAttribute('data-theme', appearance.theme);
document.documentElement.setAttribute('data-emphasis', appearance.emphasisColor);
document.documentElement.style.setProperty('--emphasis-base', appearance.emphasisColor);
```

### CSS Variables Strategy
The UI uses generic variables that react to the data attributes.

#### [index.css](file:///e:/VISUAL%20STUDIO CODE/MEKA%20TALLER/src/index.css)
```css
:root {
  --bg-main: #f4f4f5;
  --emphasis-color: #4f46e5;
  --table-header-bg: #f8fafc;
  --pill-bg: white;
}

[data-theme='gray'] {
  --bg-main: #f1f5f9;
  --table-header-bg: #f8fafc;
  --pill-bg: var(--table-header-bg);
}

/* Emphasis Color Overrides */
[data-emphasis='indigo'] { --emphasis-color: #4f46e5; }
[data-emphasis='esmeralda'] { --emphasis-color: #10b981; }
[data-emphasis='rojo'] { --emphasis-color: #ef4444; }
[data-emphasis='gris'] { --emphasis-color: #52525b; }

/* Dynamic Backgrounds for Gray Theme (Level 100) */
[data-theme='gray'][data-emphasis='indigo'] { --table-header-bg: #e0e7ff; }
[data-theme='gray'][data-emphasis='esmeralda'] { --table-header-bg: #d1fae5; }
[data-theme='gray'][data-emphasis='rojo'] { --table-header-bg: #fee2e2; }
[data-theme='gray'][data-emphasis='gris'] { --table-header-bg: #f1f5f9; }
```

### The Appearance Modal ("Apariencia")
Users select their preference through `AppearanceModal.tsx`.
*   **Automatic Save:** Changes are saved instantly to Supabase and local state.
*   **Visual Feedback:** The modal uses `cn()` to highlight selected options with the current `--emphasis-color`.

## 3. Estilizado de Componentes Clave (Minimalismo & Píldoras)

### Botones de Acción Principal
Para asegurar que las acciones importantes (como "+ NUEVO ROL", "GUARDAR COMPRA") se alineen con la identidad "minimalista y premium", se debe usar el siguiente patrón de **píldora redondeada**:

```tsx
<button className="bg-[var(--emphasis-color)] text-white px-5 py-2 rounded-full font-bold flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap">
  <Plus className="w-3.5 h-3.5" />
  NOMBRE DE LA ACCIÓN
</button>
```

*   **Redondeo Completo:** Siempre usar `rounded-full` para botones e inputs de cabecera.
*   **Tipografía Compacta:** `text-[9px]` con `uppercase` y `tracking-widest` para un look moderno y profesional.
*   **Color Dinámico:** El fondo DEBE ser `bg-[var(--emphasis-color)]` para botones primarios.

### Patrón de Cabecera Pill (Ahorro de Espacio)
Para maximizar el espacio vertical, agrupamos el buscador y los botones en una sola fila horizontal dentro de un contenedor `rounded-full`:

```tsx
<div className="flex items-center justify-between gap-4 bg-[var(--modal-bg)]/30 p-2 rounded-full border border-[var(--border-main)] shadow-sm">
  <input className="... rounded-full ..." placeholder="Buscar..." />
  <div className="flex items-center gap-2">
    <button className="... rounded-full ...">ACCION 1</button>
    <button className="... rounded-full ...">ACCION 2</button>
  </div>
</div>
```

*   **Sin Títulos Redundantes:** Se eliminan los `h1` o `h2` de las pestañas si la navegación ya indica dónde estamos, permitiendo que la tabla o el contenido principal suban y ocupen la visual principal.
