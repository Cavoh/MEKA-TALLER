import React from 'react';
import { Trash2, Hash, Calendar, Wrench, ChevronDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { InventoryItem, InvoiceItem, Personal } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface InvoiceItemTableProps {
  items: InvoiceItem[];
  inventory: InventoryItem[];
  updateItem: (idx: number, data: Partial<InvoiceItem>) => void;
  removeItem: (idx: number) => void;
  invoiceNumber: string;
  selectedMechanic: string;
  setSelectedMechanic: (m: string) => void;
  personnel: Personal[];
  onAddRow: (focusNewRow?: boolean) => void;
}

export const InvoiceItemTable: React.FC<InvoiceItemTableProps> = ({
  items,
  inventory,
  updateItem,
  removeItem,
  invoiceNumber,
  selectedMechanic,
  setSelectedMechanic,
  personnel,
  onAddRow
}) => {
  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] card-shadow overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="py-2 px-4 bg-[var(--table-header-bg)] border-b border-[var(--border-main)] flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Detalle de Servicios y Repuestos</h3>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="bg-[var(--pill-bg)] px-4 py-1 rounded-full border border-[var(--border-main)] flex items-center gap-2 shadow-sm">
            <Hash className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">No.</span>
            <span className="text-xs font-black text-[var(--text-main)] italic tracking-tight">{invoiceNumber}</span>
          </div>

          <div className="bg-[var(--pill-bg)] px-4 py-1 rounded-full border border-[var(--border-main)] flex items-center gap-2 shadow-sm">
            <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-xs font-black text-[var(--text-main)]">{format(new Date(), 'dd/MM/yyyy')}</span>
          </div>

          <div className="bg-[var(--pill-bg)] px-3 py-1 rounded-full border border-[var(--border-main)] flex items-center gap-2 shadow-sm relative">
             <Wrench className="w-3 h-3 text-[var(--emphasis-color)]" />
             <select
                value={selectedMechanic}
                onChange={(e) => setSelectedMechanic(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[var(--text-main)] outline-none uppercase cursor-pointer"
              >
                <option value="">Responsable...</option>
                {personnel.map(p => (
                  <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--table-header-bg)]/50 border-b border-[var(--border-main)]">
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-24 text-center">Cant.</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-32">SKU</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Descripción</th>
              <th className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-32 text-right">Precio Unit.</th>
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
                <td className="px-4 py-2">
                  <Input
                    id={`quantity-input-invoice-${idx}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                    className="text-center font-bold"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="text"
                    value={item.sku || ''}
                    readOnly
                    className="bg-[var(--pill-bg)]/50 font-mono uppercase text-[10px] border-none text-center"
                    placeholder="SKU"
                  />
                </td>
                <td className="px-4 py-2 relative">
                  <Input
                    type="text"
                    list={`inv-items-list-${idx}`}
                    value={item.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      const invItem = inventory.find(i => i.name === val);
                      if (invItem) {
                        updateItem(idx, { sku: invItem.sku, description: val, price: invItem.price, iva: invItem.iva || 0 });
                      } else {
                        updateItem(idx, { sku: undefined, description: val });
                      }
                    }}
                    placeholder="Escriba servicio o producto..."
                  />
                  <datalist id={`inv-items-list-${idx}`}>
                    {inventory.map(i => <option key={i.id} value={i.name} />)}
                  </datalist>
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                    className="text-right font-bold"
                  />
                </td>
                <td className="px-4 py-2">
                   <select
                      value={item.iva}
                      onChange={(e) => updateItem(idx, { iva: Number(e.target.value) })}
                      className="w-full bg-transparent text-[10px] text-center font-bold text-[var(--text-main)] outline-none border border-[var(--border-main)] rounded-lg h-9"
                    >
                      <option value={19}>19</option>
                      <option value={5}>5</option>
                      <option value={0}>0</option>
                    </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="text-xs font-black text-[var(--text-main)]">
                    ${(item.total || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-600 p-1 h-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};
