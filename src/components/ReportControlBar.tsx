import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ReportControlBarProps {
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  onExportTable: (tableName: string) => void;
  onExportAccounting: (reportType: string) => void;
}

export const ReportControlBar: React.FC<ReportControlBarProps> = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onExportTable,
  onExportAccounting
}) => {
  return (
    <div className="flex items-center justify-start gap-4 bg-[var(--modal-bg)]/30 p-2 rounded-[40px] border border-[var(--border-main)] card-shadow overflow-x-auto no-scrollbar mb-8">
      <div className="flex items-center justify-start gap-2">
        <div className="relative bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Desde</span>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
            className="text-xs font-bold bg-transparent outline-none border-none text-[var(--text-main)] focus:ring-0 w-[110px]" 
          />
        </div>
        <div className="relative bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Hasta</span>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
            className="text-xs font-bold bg-transparent outline-none border-none text-[var(--text-main)] focus:ring-0 w-[110px]" 
          />
        </div>
        <div className="relative bg-[var(--pill-bg)] rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-[var(--border-main)] min-w-[200px]">
          <select 
            id="export-db-select"
            onChange={(e) => onExportTable(e.target.value)} 
            className="appearance-none text-[10px] font-black uppercase bg-transparent outline-none !border-none px-2 cursor-pointer text-[var(--text-main)] focus:ring-0 w-full"
          >
            <option value="" className="bg-[var(--modal-bg)] text-[var(--text-main)]">Exportar Datos...</option>
            <option value="meka_invoices" className="bg-[var(--modal-bg)] text-[var(--text-main)]">FACTURACIÓN</option>
            <option value="meka_shipping" className="bg-[var(--modal-bg)] text-[var(--text-main)]">COMPRAS</option>
            <option value="meka_inventory" className="bg-[var(--modal-bg)] text-[var(--text-main)]">INVENTARIO</option>
            <option value="meka_clients" className="bg-[var(--modal-bg)] text-[var(--text-main)]">CLIENTES</option>
            <option value="meka_maintenance" className="bg-[var(--modal-bg)] text-[var(--text-main)]">MANTENIMIENTO</option>
            <option value="meka_arqueos_caja" className="bg-[var(--modal-bg)] text-[var(--text-main)]">ARQUEOS CAJA</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-4 pointer-events-none" />
        </div>

        <div className="relative bg-[var(--emphasis-color)]/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-[var(--emphasis-color)]/30 min-w-[200px]">
          <select 
            id="contabilidad-select"
            onChange={(e) => onExportAccounting(e.target.value)} 
            className="appearance-none text-[10px] font-black uppercase bg-transparent outline-none !border-none px-2 cursor-pointer text-[var(--emphasis-color)] focus:ring-0 w-full"
          >
            <option value="" className="bg-[var(--modal-bg)] text-[var(--text-main)]">Contabilidad...</option>
            <option value="cuentas_pagar" className="bg-[var(--modal-bg)] text-[var(--text-main)]">CUENTAS POR PAGAR (PASIVOS)</option>
            <option value="cuentas_cobrar" className="bg-[var(--modal-bg)] text-[var(--text-main)]">CUENTAS POR COBRAR (ACTIVOS)</option>
            <option value="inventario_valorizado" className="bg-[var(--modal-bg)] text-[var(--text-main)]">VALORIZACIÓN INVENTARIO</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--emphasis-color)] absolute right-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
