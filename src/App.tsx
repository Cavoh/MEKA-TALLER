import React, { useState, useEffect, createContext, useRef, lazy, Suspense } from 'react';
import {
  History,
  Settings,
  Users,
  Package,
  FileText,
  LogOut,
  Wrench,
  UserCheck,
  LayoutDashboard,
  Search,
  Lock,
  Menu,
  X,
  Plus,
  Car,
  ChevronRight,
  User,
  ShieldAlert,
  Shield,
  ShoppingBag,
  Palette,
  TrendingUp,
  Wallet,
  CreditCard,
  Activity
} from 'lucide-react';
import { cn } from './utils';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Tenant, WorkshopContextType, Tab } from './types';

// --- V13 Components (Lazy Loading) ---
const ClientsTab = lazy(() => import('./features/clients/ClientsTab'));
const InvoicingTab = lazy(() => import('./features/invoicing/InvoicingTab'));
const PurchasesTab = lazy(() => import('./features/purchases/PurchasesTab'));
const InventoryTab = lazy(() => import('./features/inventory/InventoryTab'));
const MaintenanceTab = lazy(() => import('./features/maintenance/MaintenanceTab'));
const ConfigTab = lazy(() => import('./components/ConfigTab'));
const RolesTab = lazy(() => import('./components/RolesTab'));
const PersonalTab = lazy(() => import('./components/PersonalTab'));
const StaffLogin = lazy(() => import('./components/StaffLogin'));
const Login = lazy(() => import('./components/Login'));
const ReportsTab = lazy(() => import('./features/reports/ReportsTab')); // VENTA DIARIA
const ReportsViewTab = lazy(() => import('./features/reports/ReportsViewTab')); // INFORMES (GRÀFICOS)
const ReceivablesTab = lazy(() => import('./features/accounts/ReceivablesTab'));
const PayablesTab = lazy(() => import('./features/accounts/PayablesTab'));

import SettingsModal from './components/SettingsModal';
import AppearanceModal from './components/AppearanceModal';
import ToastProvider, { useToast } from './components/ToastProvider';
import Header from './components/Navigation/Header';
import { SkeletonLoader } from './components/ui/SkeletonLoader';

import { WorkshopContext } from './context/WorkshopContext';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [staff, setStaff] = useState<any>(() => {
    const saved = localStorage.getItem('meka_current_staff');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Persistir staff automáticamente cuando cambie
  useEffect(() => {
    if (staff) {
      localStorage.setItem('meka_current_staff', JSON.stringify(staff));
    } else {
      localStorage.removeItem('meka_current_staff');
    }
  }, [staff]);

  const [permissions, setPermissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('meka_active_tab') || 'CLIENTES');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('meka_appearance');
    return saved ? JSON.parse(saved) : { theme: 'light', emphasisColor: 'indigo' };
  });

  useEffect(() => {
    localStorage.setItem('meka_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('meka_appearance', JSON.stringify(appearance));
    document.documentElement.setAttribute('data-theme', appearance.theme);
    document.documentElement.setAttribute('data-emphasis', appearance.emphasisColor);
    document.documentElement.style.setProperty('--emphasis-base', appearance.emphasisColor);
  }, [appearance]);

  // 1. Inicialización de sesión (PURA, sin bypass)
  useEffect(() => {
    const init = async () => {
      // FORZAR la destrucción de cualquier bypass fantasma del pasado
      localStorage.removeItem('meka_master_bypass');

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session?.user) {
        setStaff(null);
        localStorage.removeItem('meka_current_staff');
      }
      setInitialized(true);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setUser(s?.user ?? null);
      if (!s?.user) {
        setStaff(null);
        setTenant(null);
        localStorage.removeItem('meka_current_staff');
      }
    });

    const timer = setTimeout(() => setInitialized(true), 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 1.5 Carga de Taller (Tenant) - Reactiva al usuario logueado
  useEffect(() => {
    const loadTenant = async () => {
      if (!user) return;

      try {
        // 1. Buscar perfil vinculado al UID
        let { data: profile, error: pError } = await supabase
          .from('meka_user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // 2. Si no hay vínculo, intentar por email (Auto-vínculo para nuevos registros)
        if (!profile && user.email) {
          const { data: emailProfile } = await supabase
            .from('meka_user_profiles')
            .select('*')
            .eq('email', user.email.toLowerCase())
            .is('user_id', null)
            .maybeSingle();

          if (emailProfile) {
            // Vincular UID al perfil existente
            const { data: updatedProfile } = await supabase
              .from('meka_user_profiles')
              .update({ user_id: user.id })
              .eq('id', emailProfile.id)
              .select()
              .single();
            profile = updatedProfile;
          }
        }

        if (profile) {
          // 3. Cargar datos del taller
          const { data: tData, error: tError } = await supabase
            .from('meka_tenants')
            .select('*')
            .eq('id', profile.tenant_id)
            .single();

          if (tError) throw tError;
          setTenant(tData);
        } else {
          console.warn('No se encontró un perfil para el usuario:', user.email);
          // Opcional: setTenant(null) o redirigir a una página de bienvenida/soporte
          setTenant({ name: 'Sin Taller Asignado', id: null });
        }
      } catch (err) {
        console.error('Error cargando tenant:', err);
        // Fallback de emergencia/recuperación si es necesario
        const recoveryId = '00000000-0000-0000-0000-000000000000';
        const { data: rData } = await supabase.from('meka_tenants').select('*').eq('id', recoveryId).single();
        setTenant(rData || { name: 'Meka Taller (Recuperado)', id: recoveryId });
      }
    };
    loadTenant();
  }, [user]);

  // Suscripción en tiempo real para cambios en el taller (ej: número de factura)
  useEffect(() => {
    if (!tenant?.id) return;

    const tenantChannel = supabase.channel(`tenant_changes_${tenant.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'meka_tenants', 
        filter: `id=eq.${tenant.id}` 
      }, (payload) => {
        if (payload.new) {
          // Solo actualizar si hay cambios reales para evitar bucles
          setTenant((prev: any) => ({ ...prev, ...payload.new }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tenantChannel);
    };
  }, [tenant?.id]);

  // 2. Carga de Permisos
  useEffect(() => {
    const loadPerms = async () => {
      if (!staff) return;
      if (staff.roleId === 'ADMIN') {
        setPermissions([]);
        return;
      }
      try {
        const { data } = await supabase.from('meka_roles').select('permissions').eq('name', staff.roleId).single();
        setPermissions(data?.permissions || []);
      } catch (e) { console.error(e); }
    };
    loadPerms();
  }, [staff]);

  const headerRef = useRef<HTMLElement>(null);
  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && headerRef.current) {
      const focusable = headerRef.current.querySelectorAll('button:not([disabled])');
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  };

  const allTabs = [
    { id: 'CLIENTES', label: 'CLIENTES' },
    { id: 'FACTURAR', label: 'Facturar', icon: FileText, color: 'text-zinc-600' },
    { id: 'COMPRAS', label: 'Compras', icon: ShoppingBag, color: 'text-zinc-600' },
    { id: 'INVENTARIO', label: 'INVENTARIO' },
    { id: 'CXC', label: 'C x Cobrar', icon: Wallet, color: 'text-zinc-600' },
    { id: 'CXP', label: 'C x Pagar', icon: CreditCard, color: 'text-zinc-600' },
    { id: 'MANTENIMIENTO', label: 'MANTENIMIENTO' },
    { id: 'INFORMES', label: 'VENTA DIARIA' },
    { id: 'REPORTES', label: 'INFORMES' },
    { id: 'ROLES', label: 'ROLES' },
    { id: 'PERSONAL', label: 'PERSONAL' }
  ];

  const visibleTabs = allTabs.filter(tab => {
    if (!staff) return false;
    if (staff.roleId === 'ADMIN') return true;
    const perm = permissions.find(p => {
      const cat = p.category.toUpperCase();
      if (tab.id === 'FACTURAR' && (cat === 'FACTURAR' || cat === 'FACTURACION')) return true;
      return cat === tab.id;
    });
    return perm ? perm.status : false;
  });

  // 3. Ajuste de Tab Activa
  useEffect(() => {
    if (visibleTabs.length > 0) {
      const isTabVisible = visibleTabs.some(t => t.id === activeTab);
      if (!isTabVisible) setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  const handleLogout = async () => {
    localStorage.removeItem('meka_current_staff');
    localStorage.removeItem('meka_active_tab');
    localStorage.removeItem('meka_master_bypass');
    await supabase.auth.signOut();
    setStaff(null);
    window.location.reload();
  };

  // --- Render Hierarchy ---
  if (!initialized) return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center font-black text-white text-[10px] tracking-widest uppercase">
      <div className="text-center">
        <Wrench className="w-10 h-10 mb-4 animate-spin mx-auto opacity-20" />
        <div className="animate-pulse">Cargando Sistema V19...</div>
      </div>
    </div>
  );

  if (!user) return (
    <Suspense fallback={<SkeletonLoader />}>
      <Login onLogin={() => { }} />
    </Suspense>
  );

  if (!staff) return (
    <Suspense fallback={<SkeletonLoader />}>
      <StaffLogin tenantId={tenant?.id} onLogin={(_u: any, p: any) => setStaff(p)} onLogoutWorkshop={handleLogout} />
    </Suspense>
  );

  const hasActionPermission = (actionId: string): boolean => {
    if (staff?.roleId === 'ADMIN') return true;
    return permissions.find((p: any) => p.category === actionId)?.status ?? false;
  };

  const toast = useToast();

  return (
    <WorkshopContext.Provider value={{ 
      user, 
      tenant, 
      staff, 
      permissions, 
      hasActionPermission, 
      logout: handleLogout, 
      switchStaff: () => {
        setStaff(null);
        localStorage.removeItem('meka_current_staff');
      },
      showToast: toast.showToast, 
      showSuccess: toast.showSuccess, 
      showError: toast.showError, 
      showInfo: toast.showInfo,
      activeTab,
      setActiveTab,
      isSettingsOpen,
      setIsSettingsOpen,
      isAppearanceOpen,
      setIsAppearanceOpen,
      visibleTabs: visibleTabs as any[]
    }}>
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans transition-colors duration-300">
        <Header />

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          tenant={tenant}
          onUpdate={(t) => setTenant(t)}
        />

        <AppearanceModal
          isOpen={isAppearanceOpen}
          onClose={() => setIsAppearanceOpen(false)}
          currentTheme={appearance.theme}
          currentEmphasis={appearance.emphasisColor}
          userEmail={staff.email}
          onUpdate={(theme, emphasis) => setAppearance({ theme, emphasisColor: emphasis })}
        />


        <main className="flex-1 p-4 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Suspense fallback={<SkeletonLoader />}>
            {activeTab === 'CLIENTES' && <ClientsTab />}
            {activeTab === 'FACTURAR' && <InvoicingTab />}
            {activeTab === 'COMPRAS' && <PurchasesTab />}
            {activeTab === 'INVENTARIO' && <InventoryTab />}
            {activeTab === 'MANTENIMIENTO' && <MaintenanceTab />}
            {activeTab === 'CXC' && <ReceivablesTab />}
            {activeTab === 'CXP' && <PayablesTab />}
            {activeTab === 'INFORMES' && <ReportsTab />}
            {activeTab === 'REPORTES' && <ReportsViewTab />}
            {activeTab === 'ROLES' && <RolesTab />}
            {activeTab === 'PERSONAL' && <PersonalTab />}
            {activeTab === 'CONFIGURACION' && <ConfigTab />}
          </Suspense>
        </main>
      </div>
    </WorkshopContext.Provider>
  );
}
