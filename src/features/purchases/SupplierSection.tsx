import React from 'react';
import { Supplier } from '../../types';
import { Search, UserPlus, Truck, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

interface SupplierSectionProps {
  searchId: string;
  setSearchId: (id: string) => void;
  onSearch: () => void;
  selectedSupplier: Supplier | null;
  onClearSupplier: () => void;
  isNewForm: boolean;
  newData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    idType: string;
    idNumber: string;
    discount: number;
    retefuente: number;
    reteica: number;
  };
  setNewData: (data: any) => void;
}

export function SupplierSection({
  searchId, setSearchId, onSearch, selectedSupplier, onClearSupplier, isNewForm, newData, setNewData
}: SupplierSectionProps) {
  return (
    <div className="bg-[var(--modal-bg)] py-4 px-6 rounded-2xl border border-[var(--border-main)] card-shadow space-y-4 h-full">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--border-main)] pb-3">
        <Truck className="w-4 h-4" />
        Información del Proveedor
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="ID / NIT"
            className="rounded-full"
            icon={<Search className="w-4 h-4" />}
          />
          <Button
            variant="primary"
            onClick={onSearch}
            className="rounded-full px-4 h-auto"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div>
          {selectedSupplier && (
            <div className="p-4 bg-[var(--pill-bg)] rounded-xl border border-[var(--border-main)] relative flex flex-col gap-3 shadow-sm animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start">
                <div className="w-full pr-6">
                  <p className="text-base font-black text-[var(--text-main)] uppercase tracking-tight">{selectedSupplier.name}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Documento</span>
                      {selectedSupplier.idType} {selectedSupplier.idNumber}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Teléfono</span>
                      {selectedSupplier.phone || 'N/A'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] lowercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px] uppercase">Email</span>
                      {selectedSupplier.email || 'N/A'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Dirección</span>
                      {selectedSupplier.address || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-main)]/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">R.FTE</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-1.5 rounded">{selectedSupplier.retefuente}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">R.ICA</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-1.5 rounded">{selectedSupplier.reteica}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">DESC</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-1.5 rounded">{selectedSupplier.discount}%</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={onClearSupplier} 
                  className="absolute top-4 right-4 p-1 h-auto border border-[var(--border-main)] rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isNewForm && (
            <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 duration-200 bg-[var(--table-header-bg)] p-4 rounded-xl border border-[var(--border-main)] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Nuevo Proveedor Detectado</p>
              </div>
              
              <Input
                placeholder="Nombre de la Empresa"
                value={newData.name}
                onChange={(e) => setNewData({ ...newData, name: e.target.value.toUpperCase() })}
                className="font-bold uppercase"
              />
              
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newData.idType}
                  onChange={(e) => setNewData({ ...newData, idType: e.target.value })}
                  options={[
                    { value: 'NIT', label: 'NIT' },
                    { value: 'CC', label: 'CC' },
                    { value: 'CE', label: 'CE' },
                  ]}
                  className="col-span-1"
                />
                <Input
                  placeholder="Número"
                  value={newData.idNumber}
                  onChange={(e) => setNewData({ ...newData, idNumber: e.target.value })}
                  className="col-span-2 font-bold"
                />
              </div>

              <Input
                placeholder="Teléfono"
                type="tel"
                value={newData.phone}
                onChange={(e) => setNewData({ ...newData, phone: e.target.value })}
              />
              <Input
                placeholder="Correo Electrónico"
                type="email"
                value={newData.email}
                onChange={(e) => setNewData({ ...newData, email: e.target.value.toLowerCase() })}
              />
              <Input
                placeholder="Dirección"
                value={newData.address}
                onChange={(e) => setNewData({ ...newData, address: e.target.value.toUpperCase() })}
              />
              
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--border-main)]/50 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Retefuente</span>
                  <Input
                    type="number"
                    value={newData.retefuente}
                    onChange={(e) => setNewData({ ...newData, retefuente: Number(e.target.value) })}
                    className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">ReteICA</span>
                  <Input
                    type="number"
                    value={newData.reteica}
                    onChange={(e) => setNewData({ ...newData, reteica: Number(e.target.value) })}
                    className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">% Desc.</span>
                  <Input
                    type="number"
                    value={newData.discount}
                    onChange={(e) => setNewData({ ...newData, discount: Number(e.target.value) })}
                    className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
