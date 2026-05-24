import React from 'react';
import { X, LogOut, Settings, Palette, User, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: any[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  staff: any;
  onSettings: () => void;
  onAppearance: () => void;
  onLogout: () => void;
  tenantName: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  tabs,
  activeTab,
  setActiveTab,
  staff,
  onSettings,
  onAppearance,
  onLogout,
  tenantName
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[var(--header-bg)] shadow-2xl flex flex-col animate-in slide-in-from-left duration-500">
        {/* Header del Menú */}
        <div className="p-6 border-b border-[var(--header-border)] flex items-center justify-between bg-gradient-to-r from-[var(--emphasis-color)]/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[var(--emphasis-color)] tracking-widest uppercase mb-1">Meka Taller</span>
            <h2 className="text-sm font-black text-[var(--header-text)] uppercase truncate max-w-[180px]">{tenantName}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-[var(--bg-main)] rounded-2xl text-[var(--header-text-muted)] hover:text-[var(--header-text)] transition-all card-shadow">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Navegación */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <p className="text-[9px] font-black text-[var(--header-text-muted)] tracking-[0.2em] uppercase mb-4 px-2">Navegación</p>
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon || ChevronRight;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                    isActive 
                      ? "bg-[var(--emphasis-color)] text-white shadow-lg shadow-[var(--emphasis-color)]/20" 
                      : "hover:bg-[var(--bg-main)] text-[var(--header-text-muted)] hover:text-[var(--header-text)]"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[var(--header-text-muted)] opacity-50 group-hover:opacity-100")} />
                  <span className={cn("text-xs font-black uppercase tracking-widest flex-1 text-left", isActive ? "text-white" : "text-[var(--header-text-muted)]")}>
                    {tab.label}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sección de Usuario y Ajustes (Bottom) */}
        <div className="p-6 bg-[var(--bg-main)]/50 border-t border-[var(--header-border)] space-y-6">
          {/* Perfil Mini */}
          <div className="flex items-center gap-4 bg-[var(--header-bg)] p-4 rounded-[2rem] border border-[var(--header-border)] card-shadow">
            <div className="w-10 h-10 bg-[var(--emphasis-color)] text-white rounded-full flex items-center justify-center font-black text-sm shadow-inner">
              {staff.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-[var(--header-text)] uppercase truncate uppercase">{staff.nombre}</p>
              <p className="text-[9px] font-bold text-[var(--header-text-muted)] uppercase tracking-tighter mt-0.5">{staff.roleId}</p>
            </div>
            <button 
              onClick={() => {
                onLogout(); 
                onClose();
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { onSettings(); onClose(); }}
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-zinc-50 rounded-2xl border border-gray-100 transition-all card-shadow group"
            >
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Ajustes</span>
            </button>
            <button 
              onClick={() => { onAppearance(); onClose(); }}
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-zinc-50 rounded-2xl border border-gray-100 transition-all card-shadow group"
            >
              <Palette className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Diseño</span>
            </button>
          </div>

          <div className="text-center">
             <p className="text-[10px] font-black text-[var(--header-text-muted)] opacity-30 tracking-[0.3em] uppercase">Meka V19 Professional</p>
          </div>
        </div>
      </div>
    </div>
  );
}
