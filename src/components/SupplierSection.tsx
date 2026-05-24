import React from 'react';
import { Supplier } from '../types';
import { Search, UserPlus, Truck, X } from 'lucide-react';

interface SupplierSectionProps {
  searchId: string;
  setSearchId: (id: string) => void;
  onSearch: () => void;
  selectedSupplier: Supplier | null;
  onClearSupplier: () => void;
  isNewForm: boolean;
  newData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    idType: string;
    idNumber: string;
    discount: number;
    retefuente: number;
    reteica: number;
  };
  setNewData: (data: any) => void;
}

export default function SupplierSection({
  searchId, setSearchId, onSearch, selectedSupplier, onClearSupplier, isNewForm, newData, setNewData
}: SupplierSectionProps) {
  return (
    <div className="bg-[var(--modal-bg)] py-1.5 px-6 rounded-2xl border border-[var(--border-main)] card-shadow space-y-3 h-full">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--border-main)] pb-3">
        <Truck className="w-4 h-4" />
        Información del Proveedor
      </h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-2">NIT / ID Proveedor</label>
          <div className="flex gap-2 bg-[var(--pill-bg)] border border-[var(--border-main)] rounded-full p-1 shadow-sm">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="flex-1 px-4 py-2 bg-transparent text-[var(--input-text)] outline-none text-xs font-bold"
              placeholder="ID / NIT"
            />
            <button
              onClick={onSearch}
              className="bg-[var(--emphasis-color)] text-white p-2 rounded-full hover:opacity-90 transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          {selectedSupplier && (
            <div className="p-4 bg-[var(--pill-bg)] rounded-xl border border-[var(--border-main)] relative flex flex-col gap-3 shadow-sm animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start">
                <div className="w-full pr-6">
                  <p className="text-base font-black text-[var(--text-main)] uppercase tracking-tight">{selectedSupplier.name}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Documento</span>
                      {selectedSupplier.idType} {selectedSupplier.idNumber}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Teléfono</span>
                      {selectedSupplier.phone || 'N/A'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] lowercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px] uppercase">Email</span>
                      {selectedSupplier.email || 'N/A'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Dirección</span>
                      {selectedSupplier.address || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-main)]/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">R.FTE</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-1.5 rounded">{selectedSupplier.retefuente}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">R.ICA</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-1.5 rounded">{selectedSupplier.reteica}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">DESC</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-1.5 rounded">{selectedSupplier.discount}%</span>
                    </div>
                  </div>
                </div>
                
                <button onClick={onClearSupplier} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--modal-bg)] rounded-full p-1 border border-[var(--border-main)] shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {isNewForm && (
            <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-200 bg-[var(--table-header-bg)] p-3 rounded-xl border border-[var(--border-main)] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Nuevo Proveedor Detectado</p>
              </div>
              <input
                type="text"
                placeholder="Nombre de la Empresa"
                value={newData.name}
                onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] font-bold outline-none uppercase"
              />
              <div className="flex gap-2">
                <select
                  value={newData.idType}
                  onChange={(e) => setNewData({ ...newData, idType: e.target.value })}
                  className="bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs px-1 text-[var(--text-main)] font-black uppercase outline-none"
                >
                  <option value="NIT">NIT</option>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                </select>
                <input
                  type="text"
                  placeholder="Número"
                  value={newData.idNumber}
                  onChange={(e) => setNewData({ ...newData, idNumber: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] font-bold outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Teléfono"
                value={newData.phone}
                onChange={(e) => setNewData({ ...newData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] font-bold outline-none"
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={newData.email}
                onChange={(e) => setNewData({ ...newData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] font-bold outline-none lowercase"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={newData.address}
                onChange={(e) => setNewData({ ...newData, address: e.target.value })}
                className="w-full px-3 py-1.5 bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg text-xs text-[var(--text-main)] font-bold outline-none uppercase"
              />
              
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Retefuente</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={newData.retefuente}
                    onChange={(e) => setNewData({ ...newData, retefuente: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">ReteICA</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={newData.reteica}
                    onChange={(e) => setNewData({ ...newData, reteica: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">% Desc.</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={newData.discount}
                    onChange={(e) => setNewData({ ...newData, discount: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
