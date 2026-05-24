import React from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  editingItem: any;
}

export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSaving,
  editingItem
}: ClientFormModalProps) {
  const idOptions = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PP', label: 'Pasaporte' },
  ];

  const footer = (
    <>
      <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit" 
        form="client-form"
        isLoading={isSaving} 
        className="flex-1"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Guardando...' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Cliente' : 'Nuevo Cliente'}
      footer={footer}
    >
      <form id="client-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo ID"
            value={formData.idType}
            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            options={idOptions}
          />
          <Input
            label="Número ID"
            required
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            placeholder="123456789"
          />
        </div>
        
        <Input
          label="Nombre Completo"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
          placeholder="Juan Pérez"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <Input
          label="Dirección"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <Input
          label="Descuento (%)"
          type="number"
          min="0"
          max="100"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
        />
      </form>
    </Modal>
  );
}
