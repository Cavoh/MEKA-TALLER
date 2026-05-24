import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../context/WorkshopContext';
import { Role } from '../types';
import { Plus, Trash2, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../utils';
import ConfirmModal from './ConfirmModal';
import { supabase } from '../supabase';
import { useToast } from './ToastProvider';
import { useFormModal } from '../hooks/useFormModal';

export default function RolesTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  
  const modal = useFormModal<Role, { name: string }>({ name: '' });


  const categories = [
    { id: 'TAB_CLIENTES', label: 'CLIENTES' },
    { id: 'TAB_FACTURAR', label: 'FACTURAR' },
    { id: 'TAB_COMPRAS', label: 'COMPRAS' },
    { id: 'TAB_INVENTARIO', label: 'INVENTARIO' },
    { id: 'TAB_MANTENIMIENTO', label: 'MANTENIMIENTO' },
    { id: 'TAB_ROLES', label: 'ROLES' },
    { id: 'TAB_CONFIGURACION', label: 'CONFIGURACION' }
  ];

  const actionPermissions = [
    { id: 'ACTION_ELIMINAR_ITEMS', label: 'Eliminar y editar ítems del módulo de mantenimiento' }
  ];

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('meka_roles')
        .select('*')
        .eq('tenant_id', tenant?.id);

      if (error) {
        showError('Error de Carga', 'No se pudieron recuperar los roles.');
        return;
      }

      const mappedRoles: Role[] = (data || []).map(r => ({
        id: r.id,
        tenantId: r.tenant_id,
        name: r.name,
        permissions: r.permissions || []
      }));
      setRoles(mappedRoles);
    } catch (err: any) {
      showError('Error de Red', 'Fallo en la comunicación con el servidor.');
    }
  };

  useEffect(() => {
    if (tenant) {
      fetchRoles();
      const channel = supabase.channel('roles_changes_v3')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'meka_roles'
        }, fetchRoles)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tenant]);

  const handleNewRole = () => {
    modal.openModal();
  };

  const submitNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !modal.formData.name.trim()) return;

    if (modal.isSaving) return;
    modal.setIsSaving(true);
    try {
      // Usamos una estructura simple para los permisos iniciales
      const initialPermissions = [
        ...categories.map(cat => ({
          category: cat.label,
          status: false
        })),
        ...actionPermissions.map(ap => ({
          category: ap.id,
          status: false
        }))
      ];

      const { data, error } = await supabase
        .from('meka_roles')
        .insert([{
          tenant_id: tenant.id,
          name: modal.formData.name.trim().toUpperCase(),
          permissions: initialPermissions
        }])
        .select();

      if (error) throw error;

      modal.closeModal();
      await fetchRoles(); // Refrescar instantáneamente
      showSuccess('Rol Creado', `El rol ${modal.formData.name.toUpperCase()} fue añadido exitosamente.`);
    } catch (err: any) {
      showError('Error al Crear', err.message || 'No se pudo crear el rol.');
    } finally {
      modal.setIsSaving(false);
    }
  };

  const togglePermission = async (role: Role, categoryLabel: string) => {
    let updatedPermissions = [...(role.permissions || [])];
    const existingIndex = updatedPermissions.findIndex(p => p.category === categoryLabel);

    if (existingIndex >= 0) {
      // El permiso ya existe, solo cambiar su estado
      updatedPermissions[existingIndex] = {
        ...updatedPermissions[existingIndex],
        status: !updatedPermissions[existingIndex].status
      };
    } else {
      // Es un permiso nuevo para un rol antiguo, lo agregamos como activo
      updatedPermissions.push({
        category: categoryLabel,
        status: true
      });
    }

    // Update local state first (optimistic)
    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: updatedPermissions } : r));

    try {
      const { error } = await supabase
        .from('meka_roles')
        .update({ permissions: updatedPermissions })
        .eq('id', role.id)
        .eq('tenant_id', tenant?.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating permission:', err);
      fetchRoles(); // Revert on error
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meka_roles')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant?.id);

      if (error) throw error;
      await fetchRoles();
      setRoleToDelete(null);
      showSuccess('Rol Eliminado', 'El rol ha sido removido del sistema.');
    } catch (err: any) {
      showError('Error al Eliminar', err.message || 'No se pudo completar la operación.');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
        <button
          onClick={handleNewRole}
          className="bg-[var(--emphasis-color)] text-white px-5 py-2 rounded-full font-bold flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest transition-all shadow-sm whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          NUEVO ROL
        </button>
      </div>

      <div className="bg-[var(--modal-bg)] rounded-3xl border border-[var(--border-main)] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-divider)]">
                <th className="px-8 py-3">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">CATEGORÍA / FUNCIÓN</span>
                </th>
                {roles.length > 0 ? roles.map((role) => (
                  <th key={role.id || roles.indexOf(role)} className="px-6 py-3 border-l border-[var(--border-main)] text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-1 group">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tighter">SISTEMA</span>
                        {role.name !== 'ADMIN' && (
                          <button
                            onClick={() => setRoleToDelete(role.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs font-black text-[var(--text-main)] uppercase bg-[var(--table-header-bg)] px-3 py-1 rounded-lg border border-[var(--border-main)] shadow-sm">
                        {role.name || 'SIN NOMBRE'}
                      </span>
                    </div>
                  </th>
                )) : (
                  <th className="px-6 py-3 border-l border-[var(--border-main)] text-center text-[var(--text-muted)] italic text-xs">
                    {tenant ? `Esperando datos para ${tenant.name}...` : 'Conectando con Supabase...'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-divider)]">
              {/* --- Sección 1: Categorías --- */}
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[var(--table-row-hover)] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wide">{cat.label}</p>
                      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">ID: {cat.id}</p>
                    </div>
                  </td>
                  {roles.map((role) => {
                    if (role.name === 'ADMIN') {
                      return (
                        <td key={role.id || roles.indexOf(role)} className="px-6 py-5 border-l border-[var(--table-divider)] text-center">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-sm">Siempre ✓</span>
                        </td>
                      );
                    }
                    const perm = (role.permissions || []).find(p => p.category === cat.label);
                    const isActive = perm?.status || false;
                    return (
                      <td key={role.id || roles.indexOf(role)} className="px-6 py-5 border-l border-[var(--table-divider)] text-center">
                        <button
                          onClick={() => togglePermission(role, cat.label)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-sm border border-[var(--border-main)]",
                            isActive ? "bg-[var(--emphasis-color)] border-transparent" : "bg-[var(--input-bg)]"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                              isActive ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* --- Separador de Sección: Permisos de Acción --- */}
              <tr className="bg-[var(--table-header-bg)]/80">
                <td colSpan={roles.length + 1} className="px-8 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight">Permisos de Acción</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Acciones granulares dentro de los módulos</span>
                  </div>
                </td>
              </tr>

              {/* --- Sección 2: Permisos de Acción --- */}
              {actionPermissions.map((ap) => (
                <tr key={ap.id} className="hover:bg-[var(--table-row-hover)] transition-colors">
                  <td className="px-8 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wide">{ap.label}</p>
                      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">ID: {ap.id}</p>
                    </div>
                  </td>
                  {roles.map((role) => {
                    if (role.name === 'ADMIN') {
                      return (
                        <td key={role.id} className="px-6 py-5 border-l border-[var(--border-main)] text-center">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">Siempre ✓</span>
                        </td>
                      );
                    }
                    const perm = (role.permissions || []).find(p => p.category === ap.id);
                    const isActive = perm?.status || false;
                    return (
                      <td key={role.id} className="px-6 py-5 border-l border-[var(--border-main)] text-center">
                        <button
                          onClick={() => togglePermission(role, ap.id)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-sm border border-[var(--border-main)]",
                            isActive ? "bg-[var(--emphasis-color)] border-transparent" : "bg-[var(--input-bg)]"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                              isActive ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--modal-bg)] rounded-[2rem] card-shadow w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-[var(--border-main)]">
            <div className="p-8 bg-zinc-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight">NUEVO ROL</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Nombre para el perfil</p>
              </div>
              <button
                onClick={modal.closeModal}
                className="p-2 hover:bg-[var(--modal-bg)]/10 rounded-full transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={submitNewRole} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Nombre del Rol</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modal.formData.name}
                  onChange={(e) => modal.setFormData({ ...modal.formData, name: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl px-5 py-4 font-black text-lg outline-none focus:border-[var(--input-focus-border)] transition-all uppercase placeholder:text-[var(--input-placeholder)]"
                  placeholder="Ej: MECANICO"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={modal.closeModal}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-[var(--text-muted)] hover:bg-[var(--input-bg)] transition-colors uppercase text-[10px] tracking-widest border border-[var(--border-main)]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={modal.isSaving}
                  className="flex-1 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all card-shadow shadow-zinc-200 active:scale-95 disabled:opacity-50"
                >
                  {modal.isSaving ? 'CREANDO...' : 'CREAR ROL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!roleToDelete}
        title="Eliminar Rol"
        message="¿Estás seguro de que deseas eliminar este rol permanentemente?"
        onConfirm={() => roleToDelete && handleDeleteRole(roleToDelete)}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  );
}


