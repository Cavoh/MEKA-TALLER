import React, { useState, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { Client } from '../../types';
import { Search, UserPlus } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastProvider';
import { useFormModal } from '../../hooks/useFormModal';
import { useSearchPagination } from '../../hooks/useSearchPagination';

// Subcomponentes del Feature
import { ClientsTable } from './ClientsTable';
import { ClientFormModal } from './ClientFormModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// React Query Hooks
import { useClients, useSaveClient, useDeleteClient } from '../../hooks/queries/useClientsQuery';

export default function ClientsTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError, showInfo } = useToast();
  
  const { search, setSearch, debouncedSearch, page, setPage, pageSize } = useSearchPagination();
  
  const initialClientData = {
    name: '', phone: '', email: '', address: '', idType: 'CC', idNumber: '', discount: 0
  };
  const modal = useFormModal<Client, typeof initialClientData>(initialClientData);

  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // React Query: Fetching
  const { data, isLoading } = useClients(tenant?.id, debouncedSearch, page, pageSize);

  // React Query: Mutations
  const saveMutation = useSaveClient();
  const deleteMutation = useDeleteClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    if (!modal.formData.name.trim() || !modal.formData.idNumber.trim()) {
      showInfo('Datos Incompletos', 'Completa el Nombre y Número ID para continuar.');
      return;
    }

    try {
      await saveMutation.mutateAsync({ 
        tenantId: tenant.id, 
        clientData: modal.formData, 
        clientId: modal.editingItem?.id 
      });
      
      modal.closeModal();
      showSuccess(modal.editingItem ? 'Cliente Actualizado' : 'Cliente Creado', 'Los datos se guardaron correctamente.');
    } catch (err: any) {
      showError('Error al Guardar', err.message || 'No se pudo procesar la solicitud.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setClientToDelete(null);
      showSuccess('Cliente Eliminado', 'El registro ha sido removido del sistema.');
    } catch (err: any) {
      showError('Error al Eliminar', err.message || 'No se pudo eliminar el cliente.');
    }
  };

  const isSaving = saveMutation.isPending;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 bg-[var(--modal-bg)] p-2 rounded-full border border-[var(--border-main)] card-shadow mb-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Buscar por nombre o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="rounded-full py-2"
          />
        </div>
        <Button
          variant="pill"
          onClick={() => modal.openModal()}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Nuevo Cliente
        </Button>
      </div>

      <ClientsTable
        clients={data?.data || []}
        totalCount={data?.count || 0}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
        onEdit={modal.openModal}
        onDelete={setClientToDelete}
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={!!clientToDelete}
        title="Eliminar Cliente"
        message="¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={() => clientToDelete && handleDelete(clientToDelete)}
        onCancel={() => setClientToDelete(null)}
      />

      <ClientFormModal
        isOpen={modal.isModalOpen}
        onClose={modal.closeModal}
        onSubmit={handleSubmit}
        formData={modal.formData}
        setFormData={modal.setFormData}
        isSaving={isSaving}
        editingItem={modal.editingItem}
      />
    </div>
  );
}
