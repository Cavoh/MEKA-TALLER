import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Building2, Image, Hash, CreditCard, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';
import { Tenant } from '../types';
import { useToast } from './ToastProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onUpdate: (updatedTenant: Tenant) => void;
}

export default function SettingsModal({ isOpen, onClose, tenant, onUpdate }: SettingsModalProps) {
  const [formData, setFormData] = useState<Partial<Tenant>>({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (tenant) {
      setFormData({
        custom_name: tenant.custom_name || '',
        logo_url: tenant.logo_url || '',
        invoice_prefix: tenant.invoice_prefix || '',
        invoice_next_number: tenant.invoice_next_number || 1,
        payment_link_credit: tenant.payment_link_credit || '',
        payment_link_debit: tenant.payment_link_debit || '',
      });
    }
  }, [tenant, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meka_tenants')
        .update({
          custom_name: formData.custom_name,
          logo_url: formData.logo_url,
          invoice_prefix: formData.invoice_prefix,
          invoice_next_number: formData.invoice_next_number,
          payment_link_credit: formData.payment_link_credit,
          payment_link_debit: formData.payment_link_debit,
        })
        .eq('id', tenant.id);

      if (error) throw error;
      
      // Actualizamos localmente para feedback inmediato
      onUpdate({ 
        ...tenant, 
        custom_name: formData.custom_name,
        logo_url: formData.logo_url,
        invoice_prefix: formData.invoice_prefix,
        invoice_next_number: formData.invoice_next_number,
        payment_link_credit: formData.payment_link_credit,
        payment_link_debit: formData.payment_link_debit
      });
      showSuccess('Configuración guardada', 'Los datos del taller han sido actualizados correctamente.');
      onClose();
    } catch (err: any) {
      showError('Error al guardar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--modal-bg)] rounded-[2.5rem] card-shadow w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-[var(--border-main)]">
        <div className="p-8 bg-zinc-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tighter">CONFIGURACIÓN DEL TALLER</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] mt-1">Identidad y parámetros del sistema</p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-[var(--modal-bg)]/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <Settings className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Nombre y Logo */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Nombre del Taller
              </label>
              <input
                type="text"
                value={formData.custom_name}
                onChange={e => setFormData({ ...formData, custom_name: e.target.value })}
                className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl px-5 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all uppercase placeholder:text-[var(--input-placeholder)]"
                placeholder="Ej: MEKA CENTER"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Image className="w-3 h-3" /> Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl px-5 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all placeholder:text-[var(--input-placeholder)] text-sm"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>

          {/* Facturación */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Prefijo
                </label>
                <input
                  type="text"
                  value={formData.invoice_prefix}
                  onChange={e => setFormData({ ...formData, invoice_prefix: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl px-5 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all text-center"
                  placeholder="FAC"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Siguiente #
                </label>
                <input
                  type="number"
                  value={formData.invoice_next_number}
                  onChange={e => setFormData({ ...formData, invoice_next_number: parseInt(e.target.value) })}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl px-5 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all text-center"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Link Pago Crédito
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.payment_link_credit}
                  onChange={e => setFormData({ ...formData, payment_link_credit: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl pl-5 pr-12 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all text-sm"
                  placeholder="https://pago.com/credito"
                />
                <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Link Pago Débito
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.payment_link_debit}
                  onChange={e => setFormData({ ...formData, payment_link_debit: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--input-text)] rounded-2xl pl-5 pr-12 py-3 font-bold outline-none focus:border-[var(--input-focus-border)] transition-all text-sm"
                  placeholder="https://pago.com/debito"
                />
                <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-[var(--text-muted)] hover:bg-[var(--input-bg)] transition-colors uppercase text-[10px] tracking-widest border border-[var(--border-main)]"
            >
              Cerrar Configuración
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

