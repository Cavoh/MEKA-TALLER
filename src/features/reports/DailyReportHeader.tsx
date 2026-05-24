import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface DailyReportHeaderProps {
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  currentTotalCount: number;
  totalSalesAmount: number;
  mechanicFilter: string;
  setMechanicFilter: (m: string) => void;
  uniqueMechanics: string[];
  paymentFilter: string;
  setPaymentFilter: (p: string) => void;
  uniquePayments: string[];
  cajaAbierta: any;
  onCajaAction: () => void;
}

export function DailyReportHeader({
  dateFrom, setDateFrom, dateTo, setDateTo,
  currentTotalCount, totalSalesAmount,
  mechanicFilter, setMechanicFilter, uniqueMechanics,
  paymentFilter, setPaymentFilter, uniquePayments,
  cajaAbierta, onCajaAction
}: DailyReportHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar mb-8 bg-[var(--modal-bg)] p-2 rounded-[40px] border border-[var(--border-main)] card-shadow">
      <div className="flex items-center gap-2">
        <div className="relative bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Desde</span>
          <input 
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-xs font-bold text-[var(--text-main)] outline-none w-[110px]"
          />
        </div>

        <div className="relative bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)]">
          <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Hasta</span>
          <input 
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-xs font-bold text-[var(--text-main)] outline-none w-[110px]"
          />
        </div>

        <div className="bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)] whitespace-nowrap">
          <span className="text-[9px] font-black tracking-widest text-[#ff4b4b] uppercase">Transacciones</span>
          <span className="text-xs font-black text-[var(--text-main)]">{currentTotalCount}</span>
        </div>

        <div className="bg-[var(--pill-bg)] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)] whitespace-nowrap">
          <span className="text-[9px] font-bold tracking-widest text-[var(--emphasis-color)] uppercase">Total Facturado</span>
          <span className="text-sm font-black text-[var(--text-main)]">${totalSalesAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <select 
            value={mechanicFilter}
            onChange={(e) => setMechanicFilter(e.target.value)}
            className="appearance-none bg-[var(--pill-bg)] rounded-full pl-4 pr-10 py-2.5 shadow-sm border border-[var(--border-main)] text-[10px] font-black text-[var(--text-main)] uppercase outline-none cursor-pointer min-w-[160px]"
          >
            <option value="all">TODOS LOS MECÁNICOS</option>
            {uniqueMechanics.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="appearance-none bg-[var(--pill-bg)] rounded-full pl-4 pr-10 py-2.5 shadow-sm border border-[var(--border-main)] text-[10px] font-black text-[var(--text-main)] uppercase outline-none cursor-pointer min-w-[150px]"
          >
            <option value="all">TODOS LOS PAGOS</option>
            {uniquePayments.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {cajaAbierta ? (
          <Button 
            onClick={onCajaAction} 
            className="bg-[#fb7185] hover:bg-[#e11d48] text-white rounded-full px-6 py-2.5 shadow-md transition-all active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-wider">Cerrar Caja</span>
          </Button>
        ) : (
          <Button 
            onClick={onCajaAction} 
            className="bg-[var(--emphasis-color)] hover:opacity-90 text-white rounded-full px-6 py-2.5 shadow-md transition-all active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-wider">+ Abrir Caja</span>
          </Button>
        )}
      </div>
    </div>
  );
}
