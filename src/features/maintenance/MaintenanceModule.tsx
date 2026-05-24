import React, { useState, useEffect, useRef } from 'react';
import { Calendar, UserRound, Camera, Trash2, Trash, Printer, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { MaintenanceHistory, InventoryItem } from '../../types';

interface MaintenanceModuleProps {
  module: MaintenanceHistory;
  inventory: InventoryItem[];
  hasActionPermission: (p: string) => boolean;
  clientInfo?: { name: string; idNumber: string };
  onUpdate: (data: Partial<MaintenanceHistory>) => void | Promise<void>;
  onDelete: () => void;
  onOpenPhotos: () => void;
  onPrint: () => void;
}

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  module,
  inventory,
  hasActionPermission,
  clientInfo,
  onUpdate,
  onDelete,
  onOpenPhotos,
  onPrint
}) => {
  const isClosed = module?.status === 'closed';
  const safeItems = (module?.items || []).filter(Boolean);

  // Local string state for KM so the user can type freely without async interruptions.
  // Syncs to parent only on blur, matching the actual committed value.
  const [kmValue, setKmValue] = useState<string>(module.km != null ? String(module.km) : '');

  // Keep local state in sync when the module is loaded/replaced from the server
  useEffect(() => {
    setKmValue(module.km != null ? String(module.km) : '');
  }, [module.id]); // Only re-sync when the module itself changes, not on every km update

  const handleKmBlur = () => {
    const parsed = kmValue.trim() === '' ? undefined : Number(kmValue);
    if (parsed !== module.km) onUpdate({ km: parsed });
  };

  // Tracks the index of the row we want to focus after a new item is added
  const pendingFocusIdx = useRef<number | null>(null);

  // After React re-renders with the new row, move focus to its quantity input
  useEffect(() => {
    if (pendingFocusIdx.current !== null) {
      const el = document.getElementById(`maint-qty-${module.id}-${pendingFocusIdx.current}`);
      el?.focus();
      pendingFocusIdx.current = null;
    }
  }, [safeItems.length]); // fires when a new item is added

  const addItem = () => {
    if (isClosed) return;
    if (!module.km) {
      alert("Debes ingresar el Kilometraje (KM) antes de agregar ítems.");
      return;
    }
    pendingFocusIdx.current = safeItems.length; // index of the row that will be created
    onUpdate({ items: [...safeItems, { description: '', quantity: 1, price: 0, total: 0 }] });
  };

  const handleRowBlur = (e: React.FocusEvent<HTMLDivElement>, idx: number, item: any) => {
    // If focus moves outside the current row AND this is the last row AND it has content → add new row
    if (!e.currentTarget.contains(e.relatedTarget) && idx === safeItems.length - 1 && item?.description?.trim()) {
      addItem();
    }
  };

  const removeItem = (idx: number) => {
    if (isClosed) return;
    // Never remove the last line — reset it to blank instead (always one row available)
    if (safeItems.length === 1) {
      onUpdate({ items: [{ description: '', quantity: 1, price: 0, total: 0 }] });
      return;
    }
    const items = [...safeItems];
    items.splice(idx, 1);
    onUpdate({ items });
  };

  const updateItem = (idx: number, data: any) => {
    if (isClosed) return;
    const items = [...safeItems];
    items[idx] = { ...items[idx], ...data };
    items[idx].total = items[idx].quantity * items[idx].price;
    onUpdate({ items });
  };

  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── HEADER BAR ── */}
      <div className="py-2.5 px-4 bg-[var(--table-header-bg)] border-b border-[var(--table-divider)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">

          {/* Fecha */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] font-bold text-[var(--text-main)]">
              {module.date && !isNaN(new Date(module.date).getTime())
                ? format(new Date(module.date), 'dd/MM/yyyy HH:mm')
                : 'Fecha Pendiente'}
            </span>
          </div>

          {/* Mecánico */}
          <div className="flex items-center gap-2">
            <UserRound className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={module?.mechanic || ''}
              disabled={isClosed}
              onChange={(e) => onUpdate({ mechanic: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] p-0 w-28 outline-none"
              placeholder="Mecánico..."
            />
          </div>



          {/* Cliente info */}
          {clientInfo && (
            <div className="flex flex-col ml-2 border-l border-[var(--table-divider)] pl-4">
              <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight leading-none">{clientInfo.name}</span>
              <span className="text-[8px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest leading-none">ID: {clientInfo.idNumber}</span>
            </div>
          )}
        </div>

        {/* Right: action buttons + status */}
        <div className="flex items-center gap-2">
          <button onClick={onPrint} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors" title="Imprimir Orden de Servicio">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={onOpenPhotos} className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
          {!isClosed && hasActionPermission('ACTION_ELIMINAR_ITEMS') && (
            <button onClick={onDelete} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {isClosed ? (
            <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-2 py-1 rounded-full uppercase tracking-widest border border-zinc-300">Facturado</span>
          ) : (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Abierto</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Items */}
        <div className="space-y-3">

          {/* KM — campo obligatorio, borde rojo siempre visible */}
          {!isClosed && (
            <div
              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
              style={
                !kmValue
                  ? { border: '2.5px solid #ef4444', background: 'rgba(239,68,68,0.08)' }
                  : { border: '2px solid #f87171', background: 'var(--modal-inner-bg)' }
              }
            >
              <Gauge className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
              <div>
                <span
                  className="text-[8px] font-black uppercase tracking-widest block leading-none"
                  style={{ color: !kmValue ? '#ef4444' : '#f87171' }}
                >
                  KM {!kmValue ? '— OBLIGATORIO' : '✓'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={kmValue}
                  onChange={(e) => setKmValue(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={handleKmBlur}
                  className="bg-transparent border-none focus:ring-0 text-[13px] font-black text-[var(--text-main)] placeholder-[var(--text-muted)] p-0 w-28 outline-none leading-none"
                  placeholder="000000"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Repuestos y Servicios</h4>
          </div>
          <div className="space-y-2">
            {safeItems.map((item, i) => {
              const isLockedForRole = !hasActionPermission('ACTION_EDITAR_ITEMS') && (item?.total || 0) > 0;
              return (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-center"
                  onBlur={(e) => handleRowBlur(e, i, item)}
                >
                  <input
                    id={`maint-qty-${module?.id || 'new'}-${i}`}
                    type="number"
                    value={item?.quantity || 0}
                    disabled={isClosed || isLockedForRole}
                    onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                    className="col-span-1 px-2 py-1.5 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded text-xs text-center outline-none disabled:opacity-50"
                  />
                  <input
                    type="text"
                    list={`inventory-${module?.id || 'new'}-${i}`}
                    value={item?.description || ''}
                    disabled={isClosed || isLockedForRole}
                    onChange={(e) => {
                      const val = e.target.value;
                      const invItem = inventory.find(it => it.name === val);
                      updateItem(i, { description: val, price: invItem?.price || item?.price || 0 });
                    }}
                    className="col-span-6 px-3 py-1.5 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder-[var(--text-muted)] rounded text-xs outline-none disabled:opacity-50"
                    placeholder="Descripción..."
                  />
                  <datalist id={`inventory-${module?.id || 'new'}-${i}`}>
                    {inventory.map(it => <option key={it.id} value={it.name} />)}
                  </datalist>
                  <input
                    type="number"
                    value={item?.price || 0}
                    disabled={isClosed || isLockedForRole}
                    onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                    className="col-span-2 px-2 py-1.5 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded text-xs text-right outline-none disabled:opacity-50"
                  />
                  <div className="col-span-2 px-2 py-1.5 bg-[var(--table-header-bg)] border border-[var(--input-border)] rounded text-xs text-right font-bold text-[var(--text-main)]">
                    ${(item.total || 0).toLocaleString()}
                  </div>
                  {!isClosed && (!isLockedForRole || hasActionPermission('ACTION_ELIMINAR_ITEMS')) && (
                    <button onClick={() => removeItem(i)} className="col-span-1 p-1 text-red-500 hover:text-red-600 transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end pt-3 border-t border-[var(--border-main)]">
            <p className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">Total Servicio: <span className="text-[var(--emphasis-color)]">${safeItems.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString()}</span></p>
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Notas</h4>
          <textarea
            value={module?.notes || ''}
            disabled={isClosed}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full bg-[var(--input-bg)] border border-[var(--border-main)] rounded-xl p-3 text-sm resize-none h-16 outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--emphasis-color)] transition-colors"
            placeholder="Notas del mantenimiento..."
          />
        </div>
      </div>
    </div>
  );
};
