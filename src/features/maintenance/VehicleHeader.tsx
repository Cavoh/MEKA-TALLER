import React from 'react';
import { Search, User, Plus, X } from 'lucide-react';
import { Client } from '../../types';

interface VehicleHeaderProps {
  searchId: string;
  setSearchId: (id: string) => void;
  handleSearchClient: () => void;
  selectedClient: Client | null;
  handleNewVehicle: () => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  onClearSearch: () => void;
}

export const VehicleHeader: React.FC<VehicleHeaderProps> = ({
  searchId,
  setSearchId,
  handleSearchClient,
  selectedClient,
  handleNewVehicle,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onClearSearch
}) => {
  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar mb-4 bg-[var(--modal-bg)]/30 p-2 rounded-full border border-[var(--border-main)] card-shadow">
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative bg-[var(--pill-bg)] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Desde</span>
          <input 
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[var(--text-main)] outline-none w-[110px]"
          />
        </div>

        <div className="relative bg-[var(--pill-bg)] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Hasta</span>
          <input 
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[var(--text-main)] outline-none w-[110px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-2xl px-2">
        <div className="relative flex-1">
          <label className="absolute -top-6 left-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID Cliente</label>
          <div className="flex gap-2 bg-[var(--pill-bg)] border border-[var(--border-main)] rounded-full p-1.5 shadow-sm">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
              className="w-full px-4 bg-transparent outline-none text-xs font-bold text-[var(--text-main)] placeholder-[var(--text-muted)]"
              placeholder="Ej: 1234..."
            />
            {searchId && (
              <button onClick={onClearSearch} className="px-2 text-zinc-400 hover:text-zinc-600 transition-colors"><X className="w-3 h-3" /></button>
            )}
            <button onClick={handleSearchClient} className="bg-[var(--emphasis-color)] text-white p-1.5 rounded-full hover:opacity-90 transition-colors shrink-0">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {selectedClient ? (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-[var(--pill-bg)] border border-[var(--border-main)] border-dashed rounded-full text-[10px] font-black text-[var(--text-main)] flex items-center gap-2 uppercase font-mono">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[120px]">{selectedClient.name}</span>
            </div>
            <button
              onClick={handleNewVehicle}
              className="bg-[var(--emphasis-color)] text-white px-5 py-2.5 rounded-full font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md uppercase text-[9px] tracking-widest whitespace-nowrap active:scale-95 duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Ingreso Vehículo
            </button>
          </div>
        ) : (
          <div className="bg-[var(--pill-bg)] border border-dashed border-[var(--border-main)] rounded-full py-2 px-6 flex items-center shadow-sm">
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Modo Filtrado por Fecha</span>
          </div>
        )}
      </div>
    </div>
  );
};
