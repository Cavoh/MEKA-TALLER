import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface PurchaseSummaryProps {
  subtotal: number;
  totalDiscount: number;
  plusTax: number;
  total: number;
  onSave: () => void;
  isSaving?: boolean;
}

export function PurchaseSummary({
  subtotal,
  totalDiscount,
  plusTax,
  total,
  onSave,
  isSaving = false
}: PurchaseSummaryProps) {
  const taxableBase = subtotal - totalDiscount;

  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] card-shadow p-6 space-y-4">
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
          <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest">Base Gravable:</span>
          <span className="text-[var(--text-main)] font-black">${taxableBase.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest">IVA Total:</span>
          <span className="text-[var(--text-main)] font-black">${plusTax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-4 border-t border-[var(--border-main)] items-end">
          <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">TOTAL COMPRA:</span>
          <span className="text-3xl font-black text-emerald-500">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-[var(--table-header-bg)] p-4 border-t border-[var(--border-main)] rounded-2xl mt-4">
        <Button
          onClick={onSave}
          isLoading={isSaving}
          className="w-full py-6 rounded-full font-black text-sm shadow-xl shadow-[var(--emphasis-color)]/20 active:scale-95"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'GUARDANDO...' : 'GUARDAR COMPRA'}
        </Button>
      </div>
    </div>
  );
}
