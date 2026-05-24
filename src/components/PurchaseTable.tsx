import { Plus, Trash2, Hash, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceItem, InventoryItem } from '../types';

interface PurchaseTableProps {
  items: InvoiceItem[];
  inventory: InventoryItem[];
  onRemoveItem: (idx: number) => void;
  onUpdateItem: (idx: number, data: Partial<InvoiceItem>) => void;
  shippingNumber: string;
  onAddRow: (focusNewRow?: boolean) => void;
}

export default function PurchaseTable({
  items, inventory, onRemoveItem, onUpdateItem, shippingNumber, onAddRow
}: PurchaseTableProps) {
  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="py-0.5 px-4 bg-[var(--table-header-bg)] border-b border-[var(--border-main)] flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Detalle de Mercancía Recibida</h3>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Nº Remisión */}
          <div className="bg-[var(--pill-bg)] px-4 py-0.5 rounded-full border border-[var(--border-main)] flex items-center gap-2 shadow-sm">
            <Hash className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">No.</span>
            <span className="text-xs font-black text-[var(--text-main)] italic tracking-tight">{shippingNumber}</span>
          </div>

          {/* Fecha */}
          <div className="bg-[var(--pill-bg)] px-4 py-0.5 rounded-full border border-[var(--border-main)] flex items-center gap-2 shadow-sm">
            <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-xs font-black text-[var(--text-main)]">{format(new Date(), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--table-header-bg)]/50 border-b border-[var(--border-main)]">
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-20 text-center">Cant.</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-32">SKU</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Descripción</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-32 text-right">Costo Unit.</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-20 text-center">IVA %</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-36 text-right">Subtotal</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--table-divider)]">
            {items.map((item, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-[var(--table-row-hover)]/30 transition-colors"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    if (idx === items.length - 1 && (item.description.trim() !== '' || item.sku)) {
                      onAddRow(false);
                    }
                  }
                }}
              >
                <td className="px-4 py-3">
                  <input
                    id={`quantity-input-purchase-${idx}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(idx, { quantity: Number(e.target.value) })}
                    className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg h-9 text-sm text-center font-bold outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-zinc-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.sku || ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      const invMatch = inventory.find(i => i.sku?.toLowerCase() === val.toLowerCase());
                      if (invMatch) {
                        onUpdateItem(idx, { sku: val, description: invMatch.name, price: invMatch.price, iva: invMatch.iva || 0 });
                      } else {
                        onUpdateItem(idx, { sku: val });
                      }
                    }}
                    className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg h-9 px-2 text-xs font-mono uppercase outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-zinc-500"
                    placeholder="SKU"
                  />
                </td>
                <td className="px-4 py-3 relative">
                  <input
                    type="text"
                    list={`purch-items-${idx}`}
                    value={item.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      const invMatch = inventory.find(i => i.name === val);
                      if (invMatch) {
                        onUpdateItem(idx, { sku: invMatch.sku, description: val, price: invMatch.price, iva: invMatch.iva || 0 });
                      } else {
                        onUpdateItem(idx, { description: val });
                      }
                    }}
                    className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg h-9 px-3 text-sm outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-zinc-500"
                    placeholder="Nombre del producto"
                  />
                  <datalist id={`purch-items-${idx}`}>
                    {inventory.map(i => <option key={i.id} value={i.name} />)}
                  </datalist>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => onUpdateItem(idx, { price: Number(e.target.value) })}
                    className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg h-9 px-2 text-sm text-right font-bold outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-zinc-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.iva}
                    onChange={(e) => onUpdateItem(idx, { iva: Number(e.target.value) })}
                    className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg h-9 text-xs text-center font-bold outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-zinc-500"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-black text-[var(--text-main)]">${(item.total || 0).toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onRemoveItem(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && !e.shiftKey && idx === items.length - 1) {
                        e.preventDefault();
                        if (item.description.trim() !== '' || item.sku) {
                          onAddRow(true);
                        }
                      }
                    }}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
