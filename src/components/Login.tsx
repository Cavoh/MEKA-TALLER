import React, { useState } from 'react';
import { Wrench, Lock, User, LogIn } from 'lucide-react';
import { supabase } from '../supabase';

interface LoginProps {
  onLogin: (user: any, profile: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--table-header-bg)] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-[var(--modal-bg)] rounded-[2.5rem] card-shadow border border-[var(--border-main)] overflow-hidden">
          <div className="bg-zinc-900 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px] animate-pulse"></div>
            </div>
            <div className="inline-flex bg-[var(--modal-bg)]/10 p-4 rounded-3xl mb-4 backdrop-blur-md">
              <Wrench className="text-white w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">MekaWorkshop</h2>
            <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
              {isSignUp ? 'Crear Nueva Cuenta' : 'Acceso al Taller'}
            </p>
          </div>

          <div className="p-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[var(--text-main)] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-[var(--table-header-bg)] border-2 border-[var(--border-main)] rounded-2xl font-bold text-[var(--text-main)] outline-none focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[var(--text-main)] transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-[var(--table-header-bg)] border-2 border-[var(--border-main)] rounded-2xl font-bold text-[var(--text-main)] outline-none focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-2xl border-2 border-red-100 animate-in slide-in-from-top-2 uppercase text-center">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 card-shadow shadow-zinc-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {isSignUp ? 'Registrar Cuenta' : 'Ingresar al Sistema'}
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[10px] text-zinc-600 font-black uppercase tracking-widest hover:text-[var(--text-main)] transition-colors"
              >
                {isSignUp ? '¿Ya tienes cuenta? Iniciar Sesión' : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-[10px] text-zinc-300 font-black uppercase tracking-widest">© 2026 MekaWorkshop v4.0</p>

      </div>
    </div>
  );
}

