import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserCircle, Lock, ChevronRight, Wrench, ShieldCheck, LogOut, Users } from 'lucide-react';
import { Personal, UserProfile } from '../types';
import bcrypt from 'bcryptjs';

interface StaffLoginProps {
    tenantId?: string;
    onLogin: (user: any, profile: UserProfile) => void;
    onLogoutWorkshop: () => void;
}

export default function StaffLogin({ tenantId, onLogin, onLogoutWorkshop }: StaffLoginProps) {
    const [personnel, setPersonnel] = useState<Personal[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Personal | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchPersonnel();
        }
    }, [tenantId]);

    const fetchPersonnel = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('meka_personal')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('nombre', { ascending: true });

            if (error) throw error;

            const mapped: Personal[] = (data || []).map(p => ({
                id: p.id,
                tenantId: p.tenant_id,
                nombre: p.nombre,
                contrasena: p.contrasena,
                rolName: p.rol_name,
                rolId: p.rol_id
            }));
            setPersonnel(mapped);
        } catch (err) {
            console.error('Error fetching personnel:', err);
            setError('Error al cargar personal');
        } finally {
            setLoading(false);
        }
    };

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;

        setError('');
        setLoading(true);

        try {
            const storedPassword = selectedStaff.contrasena;
            const isHash = storedPassword.startsWith('$2') && storedPassword.length > 50;
            let passwordMatch = false;

            if (isHash) {
                // Comparación segura con hash bcrypt
                passwordMatch = await bcrypt.compare(password, storedPassword);
            } else {
                // Contraseña en texto plano
                passwordMatch = password === storedPassword;

                if (passwordMatch) {
                    // Migración silenciosa: hashear y actualizar en BD
                    const newHash = await bcrypt.hash(password, 10);
                    await supabase
                        .from('meka_personal')
                        .update({ contrasena: newHash })
                        .eq('id', selectedStaff.id);
                }
            }

            if (passwordMatch) {
                const user = {
                    email: `${selectedStaff.nombre.toLowerCase()}@meka.com`,
                    id: selectedStaff.id,
                    nombre: selectedStaff.nombre
                };
                const profile: UserProfile = {
                    id: selectedStaff.id,
                    email: user.email,
                    tenantId: selectedStaff.tenantId,
                    roleId: (selectedStaff as any).rolName || (selectedStaff as any).rol_name,
                    nombre: selectedStaff.nombre
                };
                onLogin(user, profile);
            } else {
                setError('Contraseña incorrecta');
            }
        } catch (err) {
            console.error('Error in staff login:', err);
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[var(--table-header-bg)] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-[var(--modal-bg)] rounded-[3rem] card-shadow overflow-hidden border border-[var(--border-main)]">

                {/* Left Side: Personnel List */}
                <div className="p-10 bg-zinc-900 border-r border-zinc-800 flex flex-col">
                    <div className="mb-8">
                        <div className="inline-flex bg-[var(--modal-bg)]/10 p-3 rounded-2xl mb-4">
                            <Wrench className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Personal Activo</h2>
                        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">Selecciona quién está trabajando hoy</p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {personnel.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedStaff(p);
                                    setPassword('');
                                    setError('');
                                }}
                                className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all border-2 ${selectedStaff?.id === p.id
                                    ? 'bg-[var(--modal-bg)] border-[var(--border-main)] text-[var(--text-main)] card-shadow scale-[1.02] z-10'
                                    : 'bg-zinc-800/30 border-transparent text-[var(--text-muted)] hover:bg-zinc-800 hover:text-zinc-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl transition-all ${selectedStaff?.id === p.id ? 'bg-zinc-900 text-white animate-pulse' : 'bg-zinc-800 text-zinc-600'}`}>
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-tight">{p.nombre}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedStaff?.id === p.id ? 'text-[var(--text-muted)]' : 'text-zinc-600'}`}>{p.rolName}</p>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedStaff?.id === p.id ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-700'}`}>
                                    <ChevronRight className={`w-4 h-4 transition-all ${selectedStaff?.id === p.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                </div>
                            </button>
                        ))}
                        {personnel.length === 0 && (
                            <div className="text-center py-20 bg-zinc-800/20 rounded-[3rem] border border-dashed border-zinc-800 px-6">
                                {tenantId === null ? (
                                    <>
                                        <ShieldCheck className="w-10 h-10 text-red-400 mx-auto mb-4 opacity-50" />
                                        <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">Sin Taller Asignado</p>
                                        <p className="text-zinc-500 text-[9px] mt-2">Contacta al administrador</p>
                                    </>
                                ) : (
                                    <>
                                        {loading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
                                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Users className="w-10 h-10 text-zinc-700 mx-auto mb-4 opacity-20" />
                                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">No hay personal registrado</p>
                                                <p className="text-zinc-600 text-[8px] mt-2 uppercase">Agrega personal en la tabla 'meka_personal' manualment para tu tenant.</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>


                    <div className="mt-8 space-y-4">
                        {selectedStaff && selectedStaff.nombre.toLowerCase().includes('jose') && (
                            <button
                                onClick={() => onLogin({ email: 'jose@meka.com' }, { id: selectedStaff.id, email: 'jose@meka.com', tenantId: selectedStaff.tenantId, roleId: 'ADMIN', nombre: selectedStaff.nombre })}
                                className="w-full py-4 bg-[var(--modal-bg)]/5 hover:bg-[var(--modal-bg)]/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95"
                            >
                                Acceso de Dueño (Sin PIN)
                            </button>
                        )}
                        <button
                            onClick={onLogoutWorkshop}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-zinc-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" />
                            Salir del Taller
                        </button>
                    </div>
                </div>

                {/* Right Side: Password Entry */}
                <div className="p-10 flex flex-col justify-center bg-[var(--modal-bg)] relative">
                    <div className="absolute top-10 right-10 opacity-5">
                        <ShieldCheck className="w-32 h-32 text-[var(--text-main)]" />
                    </div>
                    {selectedStaff ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <div className="mb-10 text-center">
                                <div className="inline-flex bg-zinc-900 p-8 rounded-[2.5rem] mb-6 card-shadow shadow-zinc-200">
                                    <Lock className="text-white w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">
                                    {selectedStaff.nombre.split(' ')[0]}
                                </h3>
                                <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-4">Ingresa tu llave de seguridad</p>
                            </div>

                            <form onSubmit={handleStaffLogin} className="space-y-6 max-w-sm mx-auto">
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            autoFocus
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-6 bg-[var(--table-header-bg)] border-2 border-[var(--border-main)] rounded-[2.5rem] font-black text-[var(--text-main)] outline-none focus:border-zinc-900 transition-all text-center tracking-[0.8em] text-3xl shadow-inner"
                                            placeholder="••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl border-2 border-red-100 animate-bounce uppercase text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="w-full bg-zinc-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-95 disabled:opacity-20 translate-y-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Entrar al Taller
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 opacity-30 select-none">
                            <div className="w-24 h-24 bg-[var(--table-header-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserCircle className="w-12 h-12 text-zinc-200" />
                            </div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Selecciona un usuario</p>
                            <p className="text-[9px] text-zinc-300 font-bold uppercase">MekaWorkshop v13.0</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

