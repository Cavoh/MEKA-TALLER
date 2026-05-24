# Agent Instructions: Modular Features & Appearance

When building or extending applications modeled after the Dynamic UI Theming System (`.agents/skills/appearance-theming/SKILL.md`), adhere to the following architectural guidelines:

## Core Technical Guidelines

1. **State Management for UI Speed:**
   - Use a robust, predictable state container (like React State, Zustand, or Context API) for highly interactive components.
   - Operations like changing the theme or emphasis color must update the local state instantly to ensure a snappy user experience, syncing to the backend (Supabase) asynchronously.

2. **Real-time & Persistence:**
   - Persist user preferences in `localStorage` for instant application on reload.
   - Sync preferences to the `meka_user_profiles` table to maintain settings across devices.

3. **CSS-Driven Theming & Selectors:**
   - Avoid hardcoding colors. Use CSS variables (`var(--bg-main)`, `var(--emphasis-color)`, etc.) defined in `index.css`.
   - Use `data-theme` and `data-emphasis` attributes on the `<html>` element for robust CSS selection. This replaces fragile `style*=` selectors.

4. **Component Reusability:**
   - UI elements should be built as generic components that consume the theme variables automatically.
   - Use the `cn()` utility for conditional styling, especially when highlighting active states with the current emphasis color.

5. **Action Buttons & Pill Aesthetics:**
   - Primary action buttons (`+ NUEVO`, `GUARDAR`, `IMPRIMIR`) MUST use `bg-[var(--emphasis-color)]`, `rounded-full`, and `text-white`.
   - Typography for action buttons: `text-[9px] font-bold uppercase tracking-widest`.
   - Use the "Pill Header" pattern: Combine search inputs and action buttons into a single horizontal container with `rounded-full` and `shadow-sm`.

6. **Dynamic Backgrounds (Gray Theme):**
   - For the "Gray" (Gris) theme, header containers and input pills MUST use `bg-[var(--pill-bg)]` or `bg-[var(--table-header-bg)]`.
   - These variables respond to `data-emphasis` to provide a subtle tint of the brand color (Level 100).
   - Variables mapping:
     - Indigo: `#e0e7ff`
     - Emerald: `#d1fae5`
     - Red: `#fee2e2`
     - Gray: `#f1f5f9`

7. **Minimalist Layout Principles:**
   - Remove redundant module titles and subtitles to gain vertical space.
   - Consolidate all secondary actions (filters, selectors) into the same "pill" row as the primary actions.
   - Use `rounded-full` for all interactive input containers to maintain a cohesive "píldora" design language.

## Integration Workflow
When asked to build a new feature or modify the UI:
1. Identify the visual requirements (Backgrounds vs. Emphasis).
2. Review `.agents/skills/appearance-theming/SKILL.md` for the current implementation pattern.
3. Apply the technical guidelines above (especially the `rounded-full` pill pattern) to ensure a minimalist and premium and state-of-the-art feel.
