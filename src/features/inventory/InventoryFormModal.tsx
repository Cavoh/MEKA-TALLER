import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Supplier } from '../../types';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSaving: boolean;
  modalType: 'add' | 'edit' | 'entry' | 'exit';
  categories: string[];
  suppliers: Supplier[];
}

export function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSaving,
  modalType,
  categories,
  suppliers
}: InventoryFormModalProps) {
  if (modalType !== 'add' && modalType !== 'edit') return null;

  const footer = (
    <>
      <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit" 
        form="inventory-form"
        isLoading={isSaving} 
        className="flex-1 bg-zinc-900"
      >
        {isSaving ? 'PROCESANDO...' : modalType === 'add' ? 'REGISTRAR PRODUCTO' : 'GUARDAR CAMBIOS'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'add' ? 'NUEVO PRODUCTO' : 'EDITAR PRODUCTO'}
      footer={footer}
      maxWidth="xl"
    >
      <form id="inventory-form" onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input
            label="SKU / Referencia"
            required
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            placeholder="EJ: ACD-123"
            className="font-bold"
          />
          <Input
            label="Nombre del Producto"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="EJ: Pastillas de Freno delanteras"
            className="font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Descripción Detallada</label>
          <textarea 
            value={formData.description || ''} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            className="w-full px-4 py-3 bg-[var(--pill-bg)] text-[var(--text-main)] border border-[var(--border-main)] rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[var(--emphasis-color)] transition-all min-h-[80px] resize-none" 
            placeholder="Especificaciones, marca, compatibilidad..." 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Categoría</label>
            <div className="relative">
              <input 
                list="categories-list-modal"
                type="text" 
                required 
                value={formData.category || ''} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                className="w-full px-4 py-3 bg-[var(--pill-bg)] text-[var(--text-main)] border border-[var(--border-main)] rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-[var(--emphasis-color)] transition-all" 
                placeholder="Selecciona o escribe..."
              />
              <datalist id="categories-list-modal">
                {categories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
          </div>
          <Select
            label="Proveedor Principal"
            required
            value={formData.supplier || ''}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar Proveedor...' },
              ...suppliers.map(s => ({ value: s.name, label: `${s.name} - ${s.idNumber}` }))
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Input
            label="Precio Venta"
            type="number"
            required
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            icon={<span className="text-zinc-400 font-bold">$</span>}
            className="font-black"
          />
          <Select
            label="IVA (%)"
            value={formData.iva || 19}
            onChange={(e) => setFormData({ ...formData, iva: Number(e.target.value) })}
            options={[
              { value: 0, label: '0% - Exento' },
              { value: 5, label: '5% - Reducido' },
              { value: 19, label: '19% - General' },
            ]}
          />
          <Input
            label="Stock Mínimo"
            type="number"
            required
            value={formData.stock_minimo || 0}
            onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
            className="bg-red-500/5 text-red-600 border-red-200 text-center font-black"
          />
        </div>
      </form>
    </Modal>
  );
}
