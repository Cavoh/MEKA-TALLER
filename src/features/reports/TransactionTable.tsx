import React from 'react';
import { Ticket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { UnifiedTransaction } from '../../types';

interface TransactionTableProps {
  transactions: UnifiedTransaction[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  onPrint: (tx: UnifiedTransaction) => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  page,
  pageSize,
  setPage,
  onPrint
}: TransactionTableProps) {
  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginatedData = transactions.slice(page * pageSize, (page + 1) * pageSize);

  const columns = [
    {
      header: 'Comprobante',
      render: (tx: UnifiedTransaction) => {
        const isExpense = tx.type === 'EGRESO';
        return (
          <div className="flex flex-col">
            <span className="font-black text-xs text-[var(--text-main)] w-24 truncate">{tx.documentNumber}</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
              {tx.sourceType}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Fecha Grabación',
      render: (tx: UnifiedTransaction) => {
        const dateObj = parseISO(tx.date);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-black text-[var(--text-main)]">{format(dateObj, 'd/M/yyyy,')}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{format(dateObj, 'hh:mm:ss a')}</span>
          </div>
        );
      }
    },
    {
      header: 'Tipo Pago',
      render: (tx: UnifiedTransaction) => (
        <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
          {tx.paymentMethod}
        </span>
      )
    },
    {
      header: 'Mecánico',
      render: (tx: UnifiedTransaction) => (
        <span className="font-black text-[10px] text-[var(--text-main)] uppercase italic truncate max-w-[120px]" title={tx.mechanic}>
          {tx.mechanic}
        </span>
      )
    },
    {
      header: 'Cliente / Proveedor',
      render: (tx: UnifiedTransaction) => (
        <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-widest whitespace-pre-wrap leading-tight max-w-[120px] truncate" title={tx.entityName}>
          {tx.entityName}
        </span>
      )
    },
    {
      header: 'Total',
      render: (tx: UnifiedTransaction) => {
        const isExpense = tx.type === 'EGRESO';
        return (
          <span className={`font-black text-xs ${isExpense ? 'text-red-500' : 'text-[var(--text-main)]'}`}>
            {isExpense ? '-$' : '$'}{Math.abs(tx.total).toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      align: 'center' as const,
      render: (tx: UnifiedTransaction) => (
        <div className="flex justify-center">
          {(tx.sourceType === 'FACTURA' || tx.sourceType === 'ABONO CXC' || tx.sourceType === 'PAGO CXP') && tx.originalPayload && (
            <Button
              variant="ghost"
              onClick={() => onPrint(tx)}
              className="bg-red-50 hover:bg-red-100 text-[#ff4b4b] rounded-xl px-4 py-2 flex flex-col items-center justify-center gap-1 transition-colors mx-auto w-16 opacity-70 group-hover:opacity-100 h-auto"
            >
              <Ticket className={`w-4 h-4 ${tx.sourceType === 'FACTURA' ? 'text-[#ffb800]' : 'text-[#ff4b4b]'}`} />
              <span className="text-[8px] font-black tracking-widest uppercase">Ticket</span>
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table
      data={paginatedData}
      columns={columns}
      isLoading={isLoading}
      pagination={{
        currentPage: page,
        totalPages,
        onPageChange: setPage
      }}
    />
  );
}
