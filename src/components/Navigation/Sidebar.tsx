import React, { useContext } from 'react';
import { cn } from '../../utils';
import { WorkshopContext } from '../../context/WorkshopContext';

type VisibleTab = { id: string; label: string };

const navGroups = [
  { id: 'almacen', label: 'Almacén', tabs: ['INVENTARIO', 'COMPRAS', 'PROVEEDORES'] },
  { id: 'ajustes', label: 'Ajustes', tabs: ['CLIENTES', 'PERSONAL', 'ROLES'] },
  { id: 'finanzas', label: 'Finanzas', tabs: ['INFORMES', 'CXC', 'CXP', 'REPORTES'] },
  { id: 'operacion', label: 'Operación', tabs: ['MANTENIMIENTO', 'FACTURAR'] }
];

const subTabLabelMap: Record<string, string> = {
  MANTENIMIENTO: 'Mantenimiento',
  FACTURAR: 'Facturar',
  INVENTARIO: 'Inventario',
  COMPRAS: 'Compras',
  PROVEEDORES: 'Proveedores',
  INFORMES: 'Venta Diaria',
  CXC: 'C x Cobrar',
  CXP: 'C x Pagar',
  REPORTES: 'Informes',
  CLIENTES: 'Terceros',
  PERSONAL: 'Personal',
  ROLES: 'Roles'
};

interface SidebarProps {
  visibleTabs: VisibleTab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  staff: any;
  tenant: any;
  onSettings: () => void;
  onAppearance: () => void;
  onLogout: () => void;
  switchStaff: () => void;
  tenantName: string;
}

export default function Sidebar({ visibleTabs, activeTab, setActiveTab, staff, tenant, onSettings, onAppearance, onLogout, switchStaff, tenantName }: SidebarProps) {
  // Grupos ordenados alfabéticamente por label: Almacén, Ajustes, Finanzas, Operación
  const groups = navGroups
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(group => {
      const groupTabs = visibleTabs.filter((vt: VisibleTab) => group.tabs.includes(vt.id));
      return { ...group, tabs: groupTabs };
    })
    .filter(group => group.tabs.length > 0);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-0 lg:w-40 bg-[var(--bg-main)] border-r border-[var(--border-main)] z-20 flex flex-col">
      {/* Space for config module logo in sidebar header */}
      <div className="h-4 w-full border-b border-[var(--border-main)]" />

      {/* Tabs list - alphabetical, no group titles, compact */}
      {groups.map(group => (
        <div key={group.id} className="flex-1 space-y-0 px-2">
          {group.tabs.map((tab: VisibleTab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-2 py-1.5 border border-[var(--border-main)] rounded text-[9px] font-black uppercase tracking-widest hover:bg-[var(--emphasis-color)]/10 hover:text-[var(--emphasis-color)] transition-colors",
                activeTab === tab.id ? "bg-[var(--emphasis-color)]/20 text-[var(--emphasis-color)] font-black" : ""
              )}
            >
              {subTabLabelMap[tab.id] || tab.label}
            </button>
          ))}
        </div>
      ))}

      {/* User controls at bottom */}
      <div className="px-2 pb-2 space-y-1.5">
        <button
          onClick={onSettings}
          className="w-full bg-[var(--bg-main)] hover:bg-white p-1 rounded text-[8px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors"
        >
          Configuración
        </button>
        <button
          onClick={onAppearance}
          className="w-full bg-[var(--bg-main)] hover:bg-white p-1 rounded text-[8px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors"
        >
          Apariencia
        </button>
        <button
          onClick={onLogout}
          className="w-full bg-red-600/20 hover:bg-red-600 p-1 rounded text-[8px] font-black uppercase tracking-widest border border-red-600 transition-colors text-red-600"
        >
          Cerrar Sesión
        </button>
        <button
          onClick={switchStaff}
          className="w-full bg-[var(--bg-main)] hover:bg-zinc-800 p-1 rounded text-[8px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors text-white"
        >
          Cambiar Personal
        </button>
      </div>
    </aside>
  );
}