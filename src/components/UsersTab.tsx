import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../context/WorkshopContext';
import { UserProfile, Role } from '../types';
import {
  UserPlus,
  Trash2,
  Shield,
  Mail,
  Key,
  User as UserIcon,
  Plus
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { supabase } from '../supabase';
import { useToast } from './ToastProvider';

export default function UsersTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    roleId: ''
  });

  useEffect(() => {
    if (!tenant) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('meka_user_profiles')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('meka_roles')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) {
        console.error('Error fetching roles:', error);
      } else {
        const mappedRoles: Role[] = data.map(r => ({
          id: r.id,
          tenantId: r.tenant_id,
          name: r.name,
          permissions: r.permissions
        }));
        setRoles(mappedRoles);
      }
    };

    fetchUsers();
    fetchRoles();

    const usersChannel = supabase.channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meka_user_profiles', filter: `tenant_id=eq.${tenant.id}` }, fetchUsers)
      .subscribe();

    const rolesChannel = supabase.channel('roles_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meka_roles', filter: `tenant_id=eq.${tenant.id}` }, fetchRoles)
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [tenant]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Note: Creación manual del perfil. El usuario Real (Auth) debe ser invitado o creado por admin.
      const { error } = await supabase
        .from('meka_user_profiles')
        .insert({
          tenant_id: tenant.id,
          email: newUserData.email,
          role_id: newUserData.roleId
        });

      if (error) throw error;

      setShowNewUserForm(false);
      setNewUserData({ email: '', password: '', roleId: '' });
      showSuccess('Perfil Creado', 'El perfil de usuario se creó en la DB. El usuario debe registrarse con este email.');
    } catch (err: any) {
      showError('Error al Crear', err.message || 'No se pudo crear el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meka_user_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setUserToDelete(null);
      showSuccess('Usuario Eliminado', 'El perfil de usuario ha sido eliminado correctamente.');
    } catch (err: any) {
      showError('Error al Eliminar', err.message || 'No se pudo eliminar el usuario.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Gestión de Usuarios</h2>
          <p className="text-xs text-[var(--text-muted)]">Administra el personal con acceso al taller</p>
        </div>
        <button
          onClick={() => setShowNewUserForm(true)}
          className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-3 h-3" />
          NUEVO USUARIO
        </button>
      </div>

      <div className="bg-[var(--modal-bg)] rounded-3xl border border-[var(--border-main)] card-shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--table-header-bg)] border-b border-[var(--border-main)]">
              <th className="px-6 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Usuario</th>
              <th className="px-6 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Email</th>
              <th className="px-6 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rol</th>
              <th className="px-6 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--table-divider)]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--table-row-hover)]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--table-header-bg)] p-2 rounded-lg">
                      <UserIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-main)]">Personal</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-xs font-bold bg-[var(--table-header-bg)] text-zinc-600 px-2 py-1 rounded uppercase tracking-widest">
                      {roles.find(r => r.id === u.role_id)?.name || u.role_id || 'Usuario'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setUserToDelete(u.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer y el usuario perderá el acceso al sistema."
        onConfirm={() => userToDelete && handleDeleteUser(userToDelete)}
        onCancel={() => setUserToDelete(null)}
      />

      {showNewUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--modal-bg)] rounded-2xl card-shadow w-full max-w-md overflow-hidden">
            <div className="bg-zinc-900 p-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">Nuevo Usuario</h3>
              <button onClick={() => setShowNewUserForm(false)} className="text-[var(--text-muted)] hover:text-white">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--table-header-bg)] border border-[var(--border-main)] rounded-lg text-sm"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Contraseña</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--table-header-bg)] border border-[var(--border-main)] rounded-lg text-sm"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rol</label>
                <select
                  required
                  value={newUserData.roleId}
                  onChange={(e) => setNewUserData({ ...newUserData, roleId: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--table-header-bg)] border border-[var(--border-main)] rounded-lg text-sm"
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                  <option value="admin">ADMINISTRADOR</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isSaving ? 'CREANDO...' : 'CREAR USUARIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

