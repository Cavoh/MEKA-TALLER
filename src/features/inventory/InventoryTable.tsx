import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { InventoryItem } from '../../types';
import { cn } from '../../utils';

interface InventoryTableProps {
  items: InventoryItem[];
  totalCount: number;
  pageSize: number;
  page: number;
  setPage: (page: number) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function InventoryTable({
  items,
  totalCount,
  pageSize,
  page,
  setPage,
  onEdit,
  onDelete,
  isLoading
}: InventoryTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns = [
    {
      header: 'Producto',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-[var(--text-main)]">{item.name}</p>
          {item.sku && (
            <span className="text-[9px] font-bold bg-[var(--input-bg)] border border-[var(--border-main)] px-1 rounded uppercase text-[var(--text-muted)]">
              {item.sku}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Categoría',
      render: (item: InventoryItem) => (
        <span className="text-[10px] font-bold bg-[var(--input-bg)] border border-[var(--border-main)] px-2 py-0.5 rounded-full uppercase text-[var(--text-muted)]">
          {item.category}
        </span>
      )
    },
    {
      header: 'Stock Mín.',
      align: 'center' as const,
      render: (item: InventoryItem) => (
        <span className="text-xs font-bold text-zinc-400">{item.stock_minimo || 0}</span>
      )
    },
    {
      header: 'Stock',
      align: 'center' as const,
      render: (item: InventoryItem) => (
        <span className={cn(
          "text-sm font-black", 
          item.stock <= (item.stock_minimo || 0) ? "text-red-600" : "text-[var(--text-main)]"
        )}>
          {item.stock}
        </span>
      )
    },
    {
      header: 'Valor',
      align: 'right' as const,
      render: (item: InventoryItem) => (
        <span className="font-black text-sm text-[var(--emphasis-color)]">
          ${item.price.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Acciones',
      align: 'right' as const,
      render: (item: InventoryItem) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            onClick={() => onEdit(item)} 
            className="p-1.5 h-auto text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onDelete(item.id)} 
            className="p-1.5 h-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      data={items}
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
