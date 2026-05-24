import React, { useState, useEffect } from 'react';
import { X, Palette, Check, Sun, Moon, Ghost } from 'lucide-react';
import { cn } from '../utils';
import { supabase } from '../supabase';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  currentEmphasis: string;
  userEmail: string;
  onUpdate: (theme: string, emphasis: string) => void;
}

export default function AppearanceModal({ isOpen, onClose, currentTheme, currentEmphasis, userEmail, onUpdate }: AppearanceModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedEmphasis, setSelectedEmphasis] = useState(currentEmphasis);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedTheme(currentTheme);
    setSelectedEmphasis(currentEmphasis);
  }, [currentTheme, currentEmphasis, isOpen]);

  if (!isOpen) return null;

  const themes = [
    { id: 'light', label: 'CLARO', icon: Sun, bg: 'bg-white', text: 'text-zinc-900', border: 'border-zinc-200' },
    { id: 'gray', label: 'GRIS', icon: Ghost, bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-300' },
    { id: 'dark', label: 'OSCURO', icon: Moon, bg: 'bg-zinc-900', text: 'text-white', border: 'border-zinc-700' },
  ];

  const emphasisColors = [
    { id: 'indigo', label: 'ÍNDIGO', color: 'bg-indigo-600' },
    { id: 'esmeralda', label: 'ESMERALDA', color: 'bg-emerald-500' },
    { id: 'rojo', label: 'ROJO', color: 'bg-rose-500' },
    { id: 'gris', label: 'GRIS', color: 'bg-zinc-600' },
  ];

  const handleSave = async (theme: string, emphasis: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meka_user_profiles')
        .update({
          appearance_settings: { theme, emphasisColor: emphasis }
        })
        .eq('email', userEmail);

      if (error) throw error;
      
      onUpdate(theme, emphasis);
      // Actualizamos localmente primero para feedback instantáneo
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-emphasis', emphasis);
      document.documentElement.style.setProperty('--emphasis-base', emphasis);
    } catch (err: any) {
      console.error('Error saving appearance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--modal-bg)] rounded-[2.5rem] card-shadow w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-[var(--border-main)]">
        <div className="p-8 flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tighter text-[var(--text-main)] uppercase">APARIENCIA</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--table-row-hover)] rounded-full transition-colors text-[var(--text-muted)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-8">
          {/* Estilo Visual */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ESTILO VISUAL</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTheme(t.id);
                    handleSave(t.id, selectedEmphasis);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-[1.5rem] border-2 transition-all group relative",
                    selectedTheme === t.id 
                      ? "border-[var(--emphasis-color)] bg-[var(--emphasis-color)]/10 shadow-md" 
                      : "border-[var(--border-main)] bg-[var(--modal-bg)] hover:border-[var(--text-muted)]"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", selectedTheme === t.id ? "bg-[var(--emphasis-color)] text-white" : "bg-[var(--table-header-bg)] text-[var(--text-muted)]")}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-[9px] font-black tracking-widest text-center", selectedTheme === t.id ? "text-[var(--emphasis-color)]" : "text-[var(--text-muted)]")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color de Énfasis */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">COLOR DE ÉNFASIS</label>
            <div className="grid grid-cols-4 gap-3">
              {emphasisColors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedEmphasis(c.id);
                    handleSave(selectedTheme, c.id);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all p-1",
                    selectedEmphasis === c.id ? "scale-110" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-4",
                    c.color,
                    selectedEmphasis === c.id ? "border-[var(--emphasis-color)]" : "border-white"
                  )}>
                    {selectedEmphasis === c.id && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className={cn("text-[8px] font-black tracking-tighter text-center", selectedEmphasis === c.id ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
