import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../context/WorkshopContext';
import { Personal, Role } from '../types';
import { Plus, Trash2, Pencil, X, UserCircle, Shield, Key } from 'lucide-react';
import { cn } from '../utils';
import ConfirmModal from './ConfirmModal';
import { supabase } from '../supabase';
import { useToast } from './ToastProvider';
import bcrypt from 'bcryptjs';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useFormModal } from '../hooks/useFormModal';

export default function PersonalTab() {
    const { tenant } = useContext(WorkshopContext);
    const { showSuccess, showError, showInfo } = useToast();
    const [personnel, setPersonnel] = useState<Personal[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const modal = useFormModal<Personal, { nombre: string; contrasena: string; rolId: string }>({
      nombre: '',
      contrasena: '',
      rolId: ''
    });

    // Destructuración para compatibilidad con código pre-existente
    const { isSaving, setIsSaving, editingItem, setEditingItem, setIsModalOpen, formData, setFormData } = modal;
    const { nombre, contrasena, rolId } = formData;

    const setNombre = (val: string) => setFormData(prev => ({ ...prev, nombre: val }));
    const setContrasena = (val: string) => setFormData(prev => ({ ...prev, contrasena: val }));
    const setRolId = (val: string) => setFormData(prev => ({ ...prev, rolId: val }));

    const fetchPersonnel = async () => {
        try {
            const { data, error } = await supabase
                .from('meka_personal')
                .select('*')
                .eq('tenant_id', tenant.id)
                .order('nombre', { ascending: true });

            if (error) throw error;

            const mapped: Personal[] = (data || []).map(p => ({
                id: p.id,
                tenantId: p.tenant_id,
                nombre: p.nombre,
                contrasena: p.contrasena,
                rolName: p.rol_name,
                rolId: p.rol_id,
                createdAt: p.created_at
            }));
            setPersonnel(mapped);
        } catch (err) {
            console.error('Error fetching personnel:', err);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data, error } = await supabase
                .from('meka_roles')
                .select('*')
                .eq('tenant_id', tenant.id)
                .order('name', { ascending: true });

            if (error) throw error;
            setRoles(data || []);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    useEffect(() => {
        fetchPersonnel();
        fetchRoles();
    }, [tenant]);

    // Suscripción en tiempo real centralizada
    useRealtimeData('meka_personal', tenant?.id, fetchPersonnel);

    const handleOpenModal = (item: Personal | null = null) => {
        if (item) {
            setEditingItem(item);
            setNombre(item.nombre);
            setContrasena(item.contrasena);
            setRolId(item.rolId);
        } else {
            setEditingItem(null);
            setNombre('');
            setContrasena('');
            setRolId(roles[0]?.id || '');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        const selectedRole = roles.find(r => r.id === rolId);
        if (!rolId) {
            showInfo('Rol Requerido', 'Por favor selecciona un rol para el usuario.');
            return;
        }

        // Hashear la contraseña si fue modificada
        const contrasenaAGuardar = contrasena.trim();
        const isAlreadyHash = contrasenaAGuardar.startsWith('$2') && contrasenaAGuardar.length > 50;
        const hashedPassword = isAlreadyHash 
            ? contrasenaAGuardar 
            : await bcrypt.hash(contrasenaAGuardar, 10);

        const payload = {
            tenant_id: tenant.id,
            nombre: nombre.trim(),
            contrasena: hashedPassword,
            rol_id: rolId,
            rol_name: selectedRole?.name
        };

        if (isSaving) return;
        setIsSaving(true);
        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('meka_personal')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('meka_personal')
                    .insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchPersonnel();
            showSuccess(editingItem ? 'Personal Actualizado' : 'Personal Creado', 'Los datos del empleado se guardaron correctamente.');
        } catch (err: any) {
            showError('Error al Guardar', err.message || 'No se pudo procesar la solicitud.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('meka_personal')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchPersonnel();
            setItemToDelete(null);
            showSuccess('Personal Eliminado', 'El empleado ha sido eliminado correctamente.');
        } catch (err: any) {
            showError('Error al eliminar', err.message);
        }
    };

    return (
    <div className="space-y-3 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
                <button
                    onClick={() => modal.openModal()}
                    className="bg-[var(--emphasis-color)] text-white px-5 py-2 rounded-full font-bold flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest transition-all shadow-sm whitespace-nowrap active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" />
                    CREAR EMPLEADO
                </button>
            </div>

            <div className="bg-[var(--modal-bg)] rounded-3xl border border-[var(--border-main)] card-shadow overflow-hidden text-[var(--text-main)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-divider)]">
                                <th className="px-8 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Nombre</th>
                                <th className="px-8 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Contraseña</th>
                                <th className="px-8 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Rol</th>
                                <th className="px-8 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--table-divider)]">
                            {personnel.map((p) => (
                                <tr key={p.id} className="hover:bg-[var(--table-row-hover)] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[var(--table-header-bg)] p-2 rounded-lg">
                                                <UserCircle className="w-5 h-5 text-zinc-600" />
                                            </div>
                                            <span className="text-sm font-bold uppercase">{p.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-mono text-[var(--text-muted)]">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--table-header-bg)] text-zinc-600 text-[10px] font-black uppercase border border-[var(--border-main)]">
                                            {p.rolName}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => modal.openModal(p, c => ({ nombre: c.nombre, contrasena: '', rolId: c.rolId }))}
                                                className="p-2 hover:bg-[var(--table-row-hover)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setItemToDelete(p.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {personnel.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-[var(--text-muted)] italic text-sm">
                                        No hay personal registrado aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal.isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-[var(--modal-bg)] rounded-[2rem] card-shadow w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-[var(--border-main)] my-8">
                        <div className="p-8 bg-zinc-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight uppercase">{modal.editingItem ? 'EDITAR EMPLEADO' : 'NUEVO EMPLEADO'}</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1 text-zinc-300">Datos de acceso del personal</p>
                            </div>
                            <button
                                onClick={modal.closeModal}
                                className="p-2 hover:bg-[var(--modal-bg)]/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2 text-[var(--text-main)]">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        required
                                        value={modal.formData.nombre}
                                        onChange={(e) => modal.setFormData({ ...modal.formData, nombre: e.target.value })}
                                        className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all uppercase"
                                        placeholder="INGRESA EL NOMBRE"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-[var(--text-main)]">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contraseña de Acceso</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="password"
                                        required={!modal.editingItem}
                                        value={modal.formData.contrasena}
                                        onChange={(e) => modal.setFormData({ ...modal.formData, contrasena: e.target.value })}
                                        className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all uppercase"
                                        placeholder={modal.editingItem ? "Dejar en blanco para conservar" : "CONTRASEÑA"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-[var(--text-main)]">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Asignar Rol</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <select
                                        required
                                        value={modal.formData.rolId}
                                        onChange={(e) => modal.setFormData({ ...modal.formData, rolId: e.target.value })}
                                        className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all uppercase appearance-none"
                                    >
                                        <option value="" disabled>Selecciona un rol</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                                    className="flex-1 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 disabled:opacity-50"
                                >
                                    {modal.isSaving ? 'GUARDANDO...' : (modal.editingItem ? 'GUARDAR' : 'CREAR')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!itemToDelete}
                title="Eliminar Personal"
                message="¿Estás seguro de que deseas eliminar a este empleado permanentemente?"
                onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
}

