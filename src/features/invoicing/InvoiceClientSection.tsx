import React from 'react';
import { Search, X, Wrench, CreditCard, UserPlus } from 'lucide-react';
import { Client } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface InvoiceClientSectionProps {
  searchId: string;
  setSearchId: (id: string) => void;
  handleSearchClient: () => void;
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  isNewClientForm: boolean;
  newClientData: any;
  setNewClientData: (d: any) => void;
  clientModules: any[];
  serviceModuleId: string;
  setServiceModuleId: (id: string) => void;
  handleLoadFromModule: () => void;
  moduleLoading: boolean;
}

export const InvoiceClientSection: React.FC<InvoiceClientSectionProps> = ({
  searchId, setSearchId, handleSearchClient, selectedClient, setSelectedClient,
  isNewClientForm, newClientData, setNewClientData, clientModules, serviceModuleId,
  setServiceModuleId, handleLoadFromModule, moduleLoading
}) => {
  return (
    <div className="bg-[var(--modal-bg)] py-4 px-6 rounded-2xl border border-[var(--border-main)] card-shadow space-y-4 h-full">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--border-main)] pb-3">
        <CreditCard className="w-4 h-4" />
        Información del Cliente
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
            placeholder="CC / NIT / PLACA"
            className="rounded-full"
            icon={<Search className="w-4 h-4" />}
          />
          <Button
            variant="primary"
            onClick={handleSearchClient}
            className="rounded-full px-4 h-auto"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div>
          {selectedClient && (
            <div className="p-4 bg-[var(--pill-bg)] rounded-xl border border-[var(--border-main)] relative flex flex-col gap-3 shadow-sm animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start">
                <div className="w-full pr-6">
                  <p className="text-base font-black text-[var(--text-main)] uppercase tracking-tight">{selectedClient.name}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Documento</span>
                      {selectedClient.idType} {selectedClient.idNumber}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px]">Teléfono</span>
                      {selectedClient.phone || 'N/A'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] lowercase flex flex-col">
                      <span className="font-black text-[var(--text-main)] tracking-widest text-[9px] uppercase">Email</span>
                      {selectedClient.email || 'N/A'}
                    </p>
                    {selectedClient.discount > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 col-span-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Desc. Aliado</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-1.5 rounded">{selectedClient.discount}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedClient(null)} 
                  className="absolute top-4 right-4 p-1 h-auto border border-[var(--border-main)] rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isNewClientForm && (
            <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 duration-200 bg-[var(--table-header-bg)] p-4 rounded-xl border border-[var(--border-main)] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Nuevo Cliente Detectado</p>
              </div>
              
              <Input
                placeholder="Nombre Completo"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value.toUpperCase() })}
                className="font-bold uppercase"
              />
              
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newClientData.idType}
                  onChange={(e) => setNewClientData({ ...newClientData, idType: e.target.value })}
                  className="bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-xl px-2 text-[10px] font-bold text-[var(--text-main)] outline-none"
                >
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                </select>
                <Input
                  placeholder="Número"
                  value={newClientData.idNumber}
                  onChange={(e) => setNewClientData({ ...newClientData, idNumber: e.target.value })}
                  className="col-span-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Teléfono"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value.toLowerCase() })}
                />
              </div>
            </div>
          )}
        </div>

        {clientModules && clientModules.length > 0 && !selectedClient && !isNewClientForm && (
          <div className="pt-4 border-t border-[var(--border-main)] border-dashed">
            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-3 space-y-3">
               <div className="flex items-center gap-2">
                 <Wrench className="w-3 h-3 text-amber-500" />
                 <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Órdenes Abiertas ({clientModules.length})</span>
               </div>
               
               <div className="flex flex-col gap-2">
                 <select
                  onChange={(e) => setServiceModuleId(e.target.value)}
                  className="w-full bg-[var(--modal-bg)] border border-[var(--border-main)] rounded-lg py-2 px-3 text-[10px] font-bold text-[var(--text-main)] uppercase outline-none"
                  defaultValue=""
                 >
                  <option value="" disabled>Seleccionar orden...</option>
                  {clientModules.map((mod) => (
                    <option key={mod.id} value={mod.id}>PLACA: {mod.vehicle_plate} — {mod.mecanico || 'N/A'}</option>
                  ))}
                 </select>
                 
                 <Button
                  variant="primary"
                  onClick={handleLoadFromModule}
                  disabled={moduleLoading || !serviceModuleId}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest"
                 >
                  {moduleLoading ? 'CARGANDO...' : 'VINCULAR ORDEN'}
                 </Button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
