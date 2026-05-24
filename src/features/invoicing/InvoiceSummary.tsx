import React from 'react';
import { Button } from '../../components/ui/Button';
import { DollarSign, Save, ShieldCheck, TrendingUp } from 'lucide-react';

interface InvoiceSummaryProps {
  subtotal: number;
  totalDiscount: number;
  ivaTotal: number;
  total: number;
  taxableBase: number;
  handlePreSave: () => void;
  isSaving?: boolean;
  paymentType?: string;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  totalDiscount,
  ivaTotal,
  total,
  taxableBase,
  handlePreSave,
  isSaving = false,
  paymentType = 'EFECTIVO'
}) => {

  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] card-shadow p-6 space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-bold border-b border-[var(--border-main)] pb-1">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-red-500 font-bold border-b border-[var(--border-main)] pb-2">
            <span>Descuento Total</span>
            <span>-${totalDiscount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px]">Base Gravable:</span>
            <span className="text-[var(--text-main)] font-black italic">${taxableBase.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px]">IVA Total:</span>
            <span className="text-[var(--text-main)] font-black italic">${ivaTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-[var(--border-main)] items-end">
            <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">TOTAL FACTURA:</span>
            <div className="flex flex-col items-end">
               <span className="text-3xl font-black text-emerald-500 tracking-tighter">${Math.round(total).toLocaleString()}</span>
               {total > 0 && <span className="text-[8px] text-[var(--text-muted)] font-bold italic opacity-60">Pago en {paymentType}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-2">
        <Button
          variant="primary"
          onClick={handlePreSave}
          disabled={isSaving || total <= 0}
          className="w-full py-6 rounded-full font-black text-sm shadow-xl shadow-[var(--emphasis-color)]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'PROCESANDO...' : 'EMITIR FACTURA'}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 px-4 text-center mt-2">
        <ShieldCheck className="w-3 h-3" />
        Sistema de Facturación MekaWorkshop v2.5
      </div>
    </div>
  );
};
