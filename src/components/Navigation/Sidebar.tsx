import React, { useContext } from 'react';
import { cn } from '../../utils';
import { WorkshopContext } from '../../context/WorkshopContext';

const navGroups = [
  {
    id: 'operacion',
    label: 'Operación',
    tabs: ['MANTENIMIENTO', 'FACTURAR']
  },
  {
    id: 'almacen',
    label: 'Almacén',
    tabs: ['INVENTARIO', 'COMPRAS', 'PROVEEDORES']
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    tabs: ['INFORMES', 'CXC', 'CXP', 'REPORTES']
  },
  {
    id: 'ajustes',
    label: 'Ajustes',
    tabs: ['CLIENTES', 'PERSONAL', 'ROLES']
  }
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
  visibleTabs: any[];
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
  // Agrupar visibleTabs de acuerdo a los bloques lógicos definidos
  const groups = navGroups.map(group => {
    const groupTabs = group.tabs
      .map(tabId => visibleTabs.find((vt: any) => vt.id === tabId))
      .filter(Boolean) as any[];
    return { ...group, tabs: groupTabs };
  }).filter(group => group.tabs.length > 0);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--bg-main)] border-r border-[var(--border-main)] z-20 flex flex-col">
      {/* Group titles (small, as requested) */}
      {groups.map(group => (
        <div key={group.id} className="px-4 py-2 text-xs font-black uppercase tracking-widest border-b border-[var(--border-main)]">
          {group.label}
        </div>
      ))}

      {/* Tabs list - hover highlight, NO dropdowns */}
      {groups.map(group => (
        <div key={group.id} className="flex-1 space-y-1 px-4">
          {group.tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-3 py-2 border border-[var(--border-main)] rounded text-[9px] font-black uppercase tracking-widest hover:bg-[var(--emphasis-color)]/10 hover:text-[var(--emphasis-color)] transition-colors",
                activeTab === tab.id ? "bg-[var(--emphasis-color)]/20 text-[var(--emphasis-color)] font-black" : ""
              )}
            >
              {subTabLabelMap[tab.id] || tab.label}
            </button>
          ))}
        </div>
      ))}

      {/* User controls at bottom */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={onSettings}
          className="w-full bg-[var(--bg-main)] hover:bg-white p-2 rounded text-[9px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors"
        >
          Configuración
        </button>
        <button
          onClick={onAppearance}
          className="w-full bg-[var(--bg-main)] hover:bg-white p-2 rounded text-[9px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors"
        >
          Apariencia
        </button>
        <button
          onClick={onLogout}
          className="w-full bg-red-600/20 hover:bg-red-600 p-2 rounded text-[9px] font-black uppercase tracking-widest border border-red-600 transition-colors text-red-600"
        >
          Cerrar Sesión
        </button>
        <button
          onClick={switchStaff}
          className="w-full bg-[var(--bg-main)] hover:bg-zinc-800 p-2 rounded text-[9px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-colors text-white"
        >
          Cambiar Personal
        </button>
      </div>
    </aside>
  );
}