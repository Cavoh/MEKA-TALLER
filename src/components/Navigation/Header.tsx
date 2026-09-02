import React, { useContext, useState } from 'react';
import { Menu } from 'lucide-react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { cn } from '../../utils';
import MobileMenu from './MobileMenu';
import Sidebar from './Sidebar';

export default function Header() {
  const context = useContext(WorkshopContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!context) return null;

  const { 
    tenant, 
    staff, 
    activeTab, 
    setActiveTab, 
    visibleTabs, 
    setIsSettingsOpen, 
    setIsAppearanceOpen, 
    logout,
    switchStaff
  } = context;

  if (!staff || !tenant) return null;

  return (
    <header className="bg-[var(--header-bg)] px-4 lg:px-6 py-1 flex items-center justify-between shadow-sm z-50 sticky top-0 border-b border-[var(--header-border)] h-[56px]">
      {/* Mobile: Hamburger Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex lg:hidden p-2 text-[var(--header-text-muted)] hover:text-[var(--header-text)] transition-colors h-full items-center"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop: Sidebar (visible on lg+) */}
      <Sidebar
        visibleTabs={visibleTabs as any[]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staff={staff}
        tenant={tenant}
        onSettings={() => setIsSettingsOpen(true)}
        onAppearance={() => setIsAppearanceOpen(true)}
        onLogout={logout}
        switchStaff={switchStaff}
        tenantName={tenant.name}
      />

      {/* Mobile Center Branding */}
      <div className="flex lg:hidden flex-1 justify-center items-center h-full">
        <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--emphasis-color)] opacity-80">Meka Taller</h1>
      </div>

      {/* Desktop: User Controls (Ocultos si < 1024px) */}
      <div className="hidden lg:flex items-center gap-4 shrink-0 h-full">
        <div className="flex items-center gap-4 border-l border-[var(--header-border)] pl-6 h-full">
          <div className="text-right">
            <p className="text-xs font-black text-[var(--header-text)] uppercase leading-none">{staff.nombre}</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <p className="text-[9px] text-[var(--header-text-muted)] font-bold uppercase tracking-widest">{staff.rolId}</p>
              <button 
                onClick={switchStaff}
                className="text-[var(--emphasis-color)] hover:bg-[var(--emphasis-color)]/10 px-1 rounded transition-colors text-[8px] font-black uppercase tracking-tighter"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        tabs={visibleTabs as any[]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staff={staff}
        onSettings={() => setIsSettingsOpen(true)}
        onAppearance={() => setIsAppearanceOpen(true)}
        onLogout={logout}
        tenantName={tenant.name}
      />
    </header>
  );
}
