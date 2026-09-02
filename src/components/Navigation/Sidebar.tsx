import React, { useContext } from 'react';
import { cn } from '../../utils';
import { WorkshopContext } from '../../context/WorkshopContext';
import {
  Wrench,
  FileText,
  Package,
  ShoppingBag,
  Truck,
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  User,
  Users,
  Shield,
  Settings,
  Palette,
  LogOut,
  UserCog
} from 'lucide-react';

type VisibleTab = { id: string; label: string };
type IconComponent = React.ComponentType<{ className?: string }>;

// Orden de los módulos en el sidebar
const navModuleOrder = [
  'MANTENIMIENTO',
  'FACTURAR',
  'INVENTARIO',
  'COMPRAS',
  'INFORMES',
  'CXC',
  'CXP',
  'REPORTES',
  'CLIENTES',
  'PERSONAL',
  'ROLES'
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

const tabIconMap: Record<string, IconComponent> = {
  MANTENIMIENTO: Wrench,
  FACTURAR: FileText,
  INVENTARIO: Package,
  COMPRAS: ShoppingBag,
  PROVEEDORES: Truck,
  INFORMES: TrendingUp,
  CXC: Wallet,
  CXP: CreditCard,
  REPORTES: BarChart3,
  CLIENTES: User,
  PERSONAL: Users,
  ROLES: Shield
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

export default function Sidebar({
  visibleTabs,
  activeTab,
  setActiveTab,
  staff,
  tenant,
  onSettings,
  onAppearance,
  onLogout,
  switchStaff,
  tenantName
}: SidebarProps) {
  // Módulos visibles en el orden definido
  const visibleNavTabs = navModuleOrder
    .map(tabId => visibleTabs.find((vt: VisibleTab) => vt.id === tabId))
    .filter((tab): tab is VisibleTab => Boolean(tab));

  return (
    <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex lg:w-40 flex-col bg-[var(--modal-bg)] border-r border-[var(--border-main)] z-20">
      {/* Header with logo space (logo linked from CONFIGURATION) */}
      <div className="h-14 px-3 flex items-center border-b border-[var(--border-main)]">
        <div className="flex items-center gap-2 w-full">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--emphasis-color)]/10 flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-[var(--emphasis-color)]" />
          </div>
          <div className="leading-none min-w-0">
            <p className="text-[11px] font-black uppercase tracking-tight text-[var(--text-main)] truncate">Meka</p>
            <p className="text-[7px] font-bold uppercase tracking-widest text-[var(--text-muted)] truncate">Taller</p>
          </div>
        </div>
      </div>

      {/* Nav - no boxes, hover highlight + active pill indicator */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
        {visibleNavTabs.map((tab: VisibleTab) => {
          const Icon = tabIconMap[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all duration-150",
                isActive
                  ? "bg-[var(--emphasis-color)]/10 text-[var(--emphasis-color)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--table-row-hover)] hover:text-[var(--text-main)]"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-3 h-3 shrink-0",
                    isActive ? "text-[var(--emphasis-color)]" : "text-[var(--text-muted)]"
                  )}
                />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest truncate">
                {subTabLabelMap[tab.id] || tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User controls at bottom */}
      <div className="border-t border-[var(--border-main)] p-2 space-y-0.5">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-[var(--text-muted)] hover:bg-[var(--table-row-hover)] hover:text-[var(--text-main)] transition-colors"
        >
          <Settings className="w-3 h-3 shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-widest truncate">Config</span>
        </button>
        <button
          onClick={onAppearance}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-[var(--text-muted)] hover:bg-[var(--table-row-hover)] hover:text-[var(--text-main)] transition-colors"
        >
          <Palette className="w-3 h-3 shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-widest truncate">Apariencia</span>
        </button>
        <button
          onClick={switchStaff}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-[var(--text-muted)] hover:bg-[var(--table-row-hover)] hover:text-[var(--text-main)] transition-colors"
        >
          <UserCog className="w-3 h-3 shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-widest truncate">Personal</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3 h-3 shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-widest truncate">Salir</span>
        </button>
      </div>
    </aside>
  );
}