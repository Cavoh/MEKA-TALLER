import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { InventoryItem, Supplier } from '../../types';
import { Plus, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { purchaseService } from '../../services/purchaseService';
import { useToast } from '../../components/ToastProvider';
import { useFormModal } from '../../hooks/useFormModal';
import { useSearchPagination } from '../../hooks/useSearchPagination';

// Subcomponentes del Feature
import { InventoryTable } from './InventoryTable';
import { InventoryFormModal } from './InventoryFormModal';
import { StockMovementModal } from './StockMovementModal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// React Query Hooks
import { 
  useInventory, 
  useCategories, 
  useProductsByCategory, 
  useSaveInventoryItem, 
  useDeleteInventoryItem, 
  useRecordMovement 
} from '../../hooks/queries/useInventoryQuery';

export default function InventoryTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError } = useToast();
  const { search, setSearch, debouncedSearch, page, setPage, pageSize } = useSearchPagination();
  
  const initialFormData = {
    name: '', category: '', stock: 0, price: 0, description: '', sku: '', supplier: '', iva: 19, stock_minimo: 0
  };
  const modal = useFormModal<InventoryItem, typeof initialFormData>(initialFormData);

  // Estados de UI
  const [modalType, setModalType] = useState<'add' | 'edit' | 'entry' | 'exit'>('add');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [movementAmount, setMovementAmount] = useState(0);

  // React Query: Fetching data
  const { data: inventoryData, isLoading: isLoadingItems } = useInventory(tenant?.id, debouncedSearch, page, pageSize);
  const { data: categories = [] } = useCategories(tenant?.id);
  const { data: filteredProducts = [] } = useProductsByCategory(tenant?.id, selectedCategory);

  // React Query: Mutations
  const saveMutation = useSaveInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const movementMutation = useRecordMovement();

  const handleOpenModal = (type: 'add' | 'edit' | 'entry' | 'exit', item?: InventoryItem) => {
    setModalType(type);
    
    if (tenant) {
      purchaseService.getAllSuppliers(tenant.id)
        .then(setSuppliers)
        .catch(console.error);
    }

    if (item) {
      modal.openModal(item, (i) => ({
        name: i.name,
        category: i.category,
        stock: i.stock,
        price: i.price,
        description: i.description || '',
        sku: i.sku || '',
        supplier: i.supplier || '',
        iva: i.iva || 19,
        stock_minimo: i.stock_minimo || 0
      }));
      setProductSearch(item.name);
      setSelectedCategory(item.category);
    } else {
      modal.openModal();
      setProductSearch('');
      setSelectedCategory('');
    }
    setMovementAmount(0);
  };

  const handleCloseModal = () => {
    modal.closeModal();
    setProductSearch('');
    setSelectedCategory('');
    setShowProductSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
      if (modalType === 'edit' && modal.editingItem) {
        await saveMutation.mutateAsync({ tenantId: tenant.id, itemData: modal.formData, itemId: modal.editingItem.id });
      } else if (modalType === 'add') {
        await saveMutation.mutateAsync({ tenantId: tenant.id, itemData: modal.formData });
      } else if ((modalType === 'entry' || modalType === 'exit') && modal.editingItem) {
        const amount = modalType === 'entry' ? movementAmount : -movementAmount;
        const type = modalType === 'entry' ? 'ENTRADA' : 'SALIDA';
        
        await movementMutation.mutateAsync({
          tenantId: tenant.id,
          itemId: modal.editingItem.id,
          sku: modal.editingItem.sku || '',
          amount,
          type,
          description: `Movimiento manual: ${type}`
          // currentStock removed: the atomic DB function handles the calculation server-side
        });
      }

      handleCloseModal();
      showSuccess('Inventario Actualizado', 'La operación se completó exitosamente.');
    } catch (err: any) {
      showError('Error de Inventario', err.message || 'No se pudo procesar el movimiento.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setItemToDelete(null);
      showSuccess('Producto Eliminado', 'El producto ha sido removido del inventario.');
    } catch (err: any) {
      showError('Error al Eliminar', err.message || 'No se pudo eliminar el producto.');
    }
  };

  const onSelectProduct = (item: InventoryItem) => {
    modal.setEditingItem(item);
    modal.setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock,
      price: item.price,
      description: item.description || '',
      sku: item.sku || '',
      supplier: item.supplier || '',
      iva: item.iva || 19,
      stock_minimo: item.stock_minimo || 0
    });
    setProductSearch(item.name);
    setShowProductSuggestions(false);
  };

  const isMutationLoading = saveMutation.isPending || deleteMutation.isPending || movementMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-[var(--modal-bg)] p-2 rounded-full border border-[var(--border-main)] card-shadow mb-4 overflow-x-auto no-scrollbar">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Input
            placeholder="Buscar producto o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full py-2"
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Píldora de Total Ítems Estilo Buscador */}
        <div className="bg-[var(--table-header-bg)]/50 px-5 py-2 rounded-full border border-[var(--border-main)] flex items-center gap-2 shrink-0 shadow-sm transition-all hover:bg-[var(--table-header-bg)]">
           <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Ítems:</span>
           <span className="text-xs font-black text-[var(--text-main)] tracking-tight">{inventoryData?.count || 0}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="pill" onClick={() => handleOpenModal('add')}>
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
          <Button variant="pill" onClick={() => handleOpenModal('entry')} className="bg-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            Entradas
          </Button>
          <Button variant="pill" onClick={() => handleOpenModal('exit')} className="bg-orange-600">
            <ArrowDownLeft className="w-4 h-4" />
            Salidas
          </Button>
        </div>
      </div>

      {/* PROFESSIONAL TITLE AND HEADER ACTIONS */}

      <InventoryTable
        items={inventoryData?.data || []}
        totalCount={inventoryData?.count || 0}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
        onEdit={(item) => handleOpenModal('edit', item)}
        onDelete={setItemToDelete}
        isLoading={isLoadingItems}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        onCancel={() => setItemToDelete(null)}
      />

      <InventoryFormModal
        isOpen={modal.isModalOpen && (modalType === 'add' || modalType === 'edit')}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={modal.formData}
        setFormData={modal.setFormData}
        isSaving={isMutationLoading}
        modalType={modalType}
        categories={categories}
        suppliers={suppliers}
      />

      <StockMovementModal
        isOpen={modal.isModalOpen && (modalType === 'entry' || modalType === 'exit')}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        modalType={modalType === 'entry' || modalType === 'exit' ? modalType : 'entry'}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        showProductSuggestions={showProductSuggestions}
        setShowProductSuggestions={setShowProductSuggestions}
        filteredProducts={filteredProducts}
        items={inventoryData?.data || []}
        editingItem={modal.editingItem}
        onSelectProduct={onSelectProduct}
        movementAmount={movementAmount}
        setMovementAmount={setMovementAmount}
        isSaving={isMutationLoading}
      />
    </div>
  );
}
