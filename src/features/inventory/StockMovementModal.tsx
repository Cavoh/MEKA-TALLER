import React from 'react';
import { Search, Package } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { InventoryItem } from '../../types';
import { cn } from '../../utils';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  modalType: 'entry' | 'exit';
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
  showProductSuggestions: boolean;
  setShowProductSuggestions: (s: boolean) => void;
  filteredProducts: InventoryItem[];
  items: InventoryItem[];
  editingItem: InventoryItem | null;
  onSelectProduct: (item: InventoryItem) => void;
  movementAmount: number;
  setMovementAmount: (amount: number) => void;
  isSaving: boolean;
}

export function StockMovementModal({
  isOpen,
  onClose,
  onSubmit,
  modalType,
  categories,
  selectedCategory,
  setSelectedCategory,
  productSearch,
  setProductSearch,
  showProductSuggestions,
  setShowProductSuggestions,
  filteredProducts,
  items,
  editingItem,
  onSelectProduct,
  movementAmount,
  setMovementAmount,
  isSaving
}: StockMovementModalProps) {
  if (modalType !== 'entry' && modalType !== 'exit') return null;

  const footer = (
    <>
      <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
        Cancelar Operación
      </Button>
      <Button
        type="submit"
        form="stock-movement-form"
        disabled={isSaving || !editingItem}
        className={cn(
          "flex-[2] py-4", 
          modalType === 'entry' ? "bg-emerald-600 shadow-emerald-500/20" : "bg-orange-600 shadow-orange-500/20"
        )}
        isLoading={isSaving}
      >
        {isSaving ? 'PROCESANDO...' : `CONFIRMAR ${modalType === 'entry' ? 'ENTRADA' : 'SALIDA'}`}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalType === 'entry' ? 'ENTRADA INVENTARIO' : 'SALIDA INVENTARIO'}
      maxWidth="2xl"
      footer={footer}
    >
      <form id="stock-movement-form" onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Select
            label="1. Filtrar por Categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'Todas las categorías...' },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
          />
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">2. Buscar Producto</label>
            <div className="relative">
              <Input
                placeholder="Nombre o SKU..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductSuggestions(true);
                }}
                onFocus={() => setShowProductSuggestions(true)}
                icon={<Search className="w-4 h-4" />}
                className="rounded-2xl"
              />
            </div>
            
            {showProductSuggestions && (productSearch.length > 0 || selectedCategory) && (
              <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border-main)] shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                {(selectedCategory ? filteredProducts : items)
                  .filter(i => {
                    if (!productSearch) return true;
                    return i.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                           i.sku?.toLowerCase().includes(productSearch.toLowerCase());
                  })
                  .map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectProduct(item)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.sku} • {item.category}</p>
                      </div>
                      <span className={cn("text-xs font-black", item.stock <= (item.stock_minimo || 0) ? "text-red-500" : "text-emerald-500")}>{item.stock}</span>
                    </button>
                  ))}
                {(selectedCategory ? filteredProducts : items).length === 0 && (
                  <div className="px-4 py-8 text-center text-zinc-400 italic text-xs">No se encontraron productos</div>
                )}
              </div>
            )}
          </div>
        </div>

        {editingItem ? (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-[var(--border-main)] grid grid-cols-2 gap-y-4 gap-x-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="col-span-2 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
              <Package className="w-5 h-5 text-[var(--emphasis-color)]" />
              <h4 className="font-black text-sm text-zinc-900 dark:text-white uppercase">Información del Producto Seleccionado</h4>
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Descripción</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2">{editingItem.description || 'Sin descripción'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Stock Mínimo</p>
              <p className="text-xs font-black text-red-500">{editingItem.stock_minimo || 0} UNI</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">IVA Aplicado</p>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-200">{editingItem.iva || 0}%</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Stock Actual</p>
              <p className={cn("text-lg font-black", editingItem.stock <= (editingItem.stock_minimo || 0) ? "text-red-600" : "text-emerald-600")}>{editingItem.stock} UNI</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl italic text-zinc-400 text-xs">
            Selecciona un producto para ver la información detallada
          </div>
        )}

        <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-[var(--border-main)] text-center">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Cantidad a {modalType === 'entry' ? 'Ingresar' : 'Retirar'}</label>
          <div className="flex items-center justify-center gap-4">
            <input 
              type="number" 
              min="1" 
              required 
              value={movementAmount || ''} 
              onChange={(e) => setMovementAmount(Number(e.target.value))} 
              placeholder="0"
              className={cn(
                "w-40 px-4 py-4 text-3xl font-black text-center bg-white dark:bg-zinc-800 border-2 rounded-2xl outline-none focus:ring-4 transition-all",
                modalType === 'entry' ? "border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500/20 text-emerald-600" : "border-orange-200 dark:border-orange-900/50 focus:ring-orange-500/20 text-orange-600"
              )} 
            />
            <span className="text-zinc-300 dark:text-zinc-600 font-black text-xl">UNI</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
