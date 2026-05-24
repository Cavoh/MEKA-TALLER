import React, { ReactNode } from 'react';
import { cn } from '../../utils';
import { Button } from './Button';

interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T>({ 
  data, 
  columns, 
  isLoading, 
  emptyMessage = "No se encontraron registros",
  pagination 
}: TableProps<T>) {
  return (
    <div className="bg-[var(--modal-bg)] rounded-2xl border border-[var(--border-main)] card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-divider)]">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-6 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest",
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--table-divider)]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                  Cargando datos...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[var(--table-row-hover)] transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={cn(
                        "px-6 py-4",
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right",
                        col.className
                      )}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-[var(--table-header-bg)]/30 border-t border-[var(--table-divider)] flex items-center justify-between">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
            Página {pagination.currentPage + 1} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 0}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
