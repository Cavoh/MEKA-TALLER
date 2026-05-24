import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Client } from '../../types';

interface ClientsTableProps {
  clients: Client[];
  totalCount: number;
  pageSize: number;
  page: number;
  setPage: (page: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ClientsTable({
  clients,
  totalCount,
  pageSize,
  page,
  setPage,
  onEdit,
  onDelete,
  isLoading
}: ClientsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns = [
    {
      header: 'Nombre',
      render: (client: Client) => (
        <p className="font-bold text-[var(--text-main)] text-sm">{client.name}</p>
      )
    },
    {
      header: 'Identificación',
      render: (client: Client) => (
        <span className="text-xs font-mono bg-[var(--input-bg)] border border-[var(--input-border)] px-2 py-1 rounded text-[var(--text-muted)]">
          {client.idType} {client.idNumber}
        </span>
      )
    },
    {
      header: 'Contacto',
      render: (client: Client) => (
        <div className="text-xs space-y-0.5">
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">{client.phone}</p>
          <p className="text-zinc-400 dark:text-zinc-500">{client.email}</p>
        </div>
      )
    },
    {
      header: 'Dirección',
      render: (client: Client) => (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">{client.address}</p>
      )
    },
    {
      header: 'Descuento',
      align: 'center' as const,
      render: (client: Client) => (
        <span className="text-xs font-bold text-[var(--emphasis-color)]">{client.discount}%</span>
      )
    },
    {
      header: 'Acciones',
      align: 'right' as const,
      render: (client: Client) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" onClick={() => onEdit(client)} className="p-1.5 h-auto">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={() => onDelete(client.id)} className="p-1.5 h-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      data={clients}
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
