import React, { useState, useContext, useEffect } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { Client, MaintenanceHistory } from '../../types';
import { Car, History, Plus } from 'lucide-react';
import { format, startOfYear, endOfDay } from 'date-fns';
import { supabase } from '../../supabase';
import { maintenanceService } from '../../services/maintenanceService';
import { useToast } from '../../components/ToastProvider';
import ConfirmModal from '../../components/ConfirmModal';
import { useSearchPagination } from '../../hooks/useSearchPagination';

// Sub-components (Feature-local)
import { VehicleHeader } from './VehicleHeader';
import { VehicleList } from './VehicleList';
import { MaintenanceModule } from './MaintenanceModule';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { ServiceOrderFormat } from './ServiceOrderFormat';

// Hooks
import { 
  useMaintenanceRecords,
  useCreateVehicle,
  useAddHistoryModule,
  useUpdateHistory,
  useUpdateSingleModule,
  useRemoveSingleModule,
  useDeleteMaintenanceRecord
} from '../../hooks/queries/useMaintenanceQuery';
import { useInventory } from '../../hooks/queries/useInventoryQuery';

export default function MaintenanceTab() {
  const { tenant, user, staff, hasActionPermission } = useContext(WorkshopContext);
  const { showSuccess, showError, showInfo } = useToast();
  
  const { search: searchId, setSearch: setSearchId, page, setPage, pageSize } = useSearchPagination(50, 0);

  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<string | undefined>(undefined);
  
  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<{ recordId: string, moduleId: string } | null>(null);
  const [printSnapshot, setPrintSnapshot] = useState<any>(null);

  // React Query: Data
  const { data: inventoryData } = useInventory(tenant?.id || '', '', 0, 1000);
  const inventory = inventoryData?.data || [];
  
  // Hook unificado: siempre filtra por rango y, si hay cliente activo, también por client_id
  const maintenanceQuery = useMaintenanceRecords(
    tenant?.id || '',
    dateFrom,
    dateTo,
    page,
    pageSize,
    selectedClient?.id
  );

  const records = maintenanceQuery.data?.data || [];
  const totalCount = maintenanceQuery.data?.count || 0;

  // Mutations
  const createVehicleMutation = useCreateVehicle();
  const addHistoryMutation = useAddHistoryModule();
  const updateHistoryMutation = useUpdateHistory();
  const updateSingleModuleMutation = useUpdateSingleModule();
  const removeSingleModuleMutation = useRemoveSingleModule();
  const deleteRecordMutation = useDeleteMaintenanceRecord();

  // Client Search Logic
  const handleSearchClient = async () => {
    if (!tenant || !searchId) return;
    try {
      const { data } = await supabase.from('meka_clients').select('*').eq('tenant_id', tenant.id).eq('id_number', searchId).single();
      if (data) {
        const client: Client = {
          id: data.id, tenantId: data.tenant_id, name: data.name, phone: data.phone,
          email: data.email, address: data.address, idType: data.id_type,
          idNumber: data.id_number, discount: Number(data.discount)
        };
        setSelectedClient(client);
        setDateFrom(format(startOfYear(new Date()), 'yyyy-MM-dd'));
        setDateTo(format(endOfDay(new Date()), 'yyyy-MM-dd'));
        setPage(0);
        showSuccess('Cliente Encontrado', `${client.name} cargado correctamente.`);
      } else {
        showInfo('No Encontrado', 'No se halló ningún cliente con ese número de identificación.');
        setSelectedClient(null);
      }
    } catch (err: any) {
      showError('Error de Búsqueda', err.message || 'Error al conectar con la base de datos.');
    }
  };

  const handleNewVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !selectedClient || !newVehiclePlate.trim()) return;
    try {
      const newRecord = await createVehicleMutation.mutateAsync({
        tenantId: tenant.id,
        clientId: selectedClient.id,
        plate: newVehiclePlate,
        mechanicName: staff?.nombre || null
      });
      setSelectedPlate(newRecord.vehiclePlate);
      setIsNewVehicleModalOpen(false);
      setNewVehiclePlate('');
      showSuccess('Vehículo Creado', `Placa ${newRecord.vehiclePlate} registrada.`);
    } catch (err: any) {
      showError('Error al Crear', err.message);
    }
  };

  const handleAddModule = async () => {
    const activeVehicle = records.find(r => r.vehiclePlate === selectedPlate);
    if (!tenant || !activeVehicle || !selectedPlate) return;
    try {
      await addHistoryMutation.mutateAsync({
        tenantId: tenant.id,
        clientId: activeVehicle.clientId,
        plate: selectedPlate,
        mechanicName: staff?.nombre || user?.email || ''
      });
      showSuccess('Servicio Agregado', 'Nuevo proceso iniciado.');
    } catch (err: any) {
      showError('Error al Agregar', err.message);
    }
  };

  const handleUpdateModule = async (recordId: string, moduleId: string, data: Partial<MaintenanceHistory>) => {
    try {
      await updateSingleModuleMutation.mutateAsync({ recordId, moduleId, updatedData: data });
    } catch (err: any) {
      if (err.message === 'OTRO_MECANICO_BORRO_ESTE_MODULO') {
        showError('Conflicto Detectado', 'Este servicio fue eliminado por otro mecánico. Recargue la página.');
      } else {
        showError('Error al Sincronizar', err.message || 'No se pudo guardar el cambio.');
      }
    }
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    const { recordId, moduleId } = moduleToDelete;

    try {
      await removeSingleModuleMutation.mutateAsync({ recordId, moduleId });
      setModuleToDelete(null);
      showSuccess('Servicio Eliminado', 'Removido satisfactoriamente.');
    } catch (err: any) {
      showError('Error al Eliminar', err.message);
    }
  };

  const handlePrintServiceOrder = (module: MaintenanceHistory, recordId: string) => {
    if (!tenant) return;
    
    // Calculate sequential number (01, 02...) based on the modules for this vehicle
    const vehicleRecords = records.filter(r => r.vehiclePlate === selectedPlate);
    const allModulesForPlate = vehicleRecords
      .flatMap(r => (r.history || []).filter(Boolean))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const index = allModulesForPlate.findIndex(m => m.id === module.id);
    const orderNumber = (index + 1).toString().padStart(2, '0');

    setPrintSnapshot({
      tenant,
      client: selectedClient || clientCache[records.find(r => r.id === recordId)?.clientId || ''] || { name: 'Cliente Particular', idNumber: '---' },
      plate: selectedPlate || '---',
      km: module.km || 0,
      mechanic: module.mechanic || staff?.nombre || '---',
      orderNumber,
      items: module.items || [],
      date: module.date,
      notes: module.notes
    });

    // Short delay to ensure React renders the printable area before window.print()
    setTimeout(() => {
      window.print();
      setPrintSnapshot(null);
    }, 500);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, recordId: string, moduleId: string) => {
    if (!tenant) return;
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await maintenanceService.uploadPhoto(tenant.id, recordId, file);
        urls.push(url);
      }
      
      const record = records.find(r => r.id === recordId);
      if (record) {
        const module = record.history.find(h => h.id === moduleId);
        if (module) {
          handleUpdateModule(recordId, moduleId, { photos: [...(module.photos || []), ...urls] });
          showSuccess('Fotos Subidas', `${urls.length} imagen(es) añadidas.`);
        }
      }
    } catch (err: any) {
      showError('Error en Carga', err.message);
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // UI Mapping
  const selectedPlateRecords = records.filter(r => r.vehiclePlate === selectedPlate);
  const activeModule = records.flatMap(r => (r.history || []).filter(Boolean)).find(h => h.id === activeModuleId);
  const activeRecord = records.find(r => (r.history || []).filter(Boolean).some(h => h.id === activeModuleId));

  const [clientCache, setClientCache] = useState<Record<string, {name: string, idNumber: string}>>({});

  useEffect(() => {
    const fetchClientsForRecords = async () => {
      const missingClientIds = [...new Set(records.map(r => r.clientId))].filter(id => id && !clientCache[id]);
      if (missingClientIds.length === 0) return;
      const { data } = await supabase.from('meka_clients').select('id, name, id_number').in('id', missingClientIds);
      if (data) {
        setClientCache(prev => {
          const newCache = { ...prev };
          data.forEach(c => newCache[c.id] = { name: c.name, idNumber: c.id_number });
          return newCache;
        });
      }
    };
    fetchClientsForRecords();
  }, [records]); // Evitamos el bucle infinito removiendo clientCache de las dependencias

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <VehicleHeader 
        searchId={searchId} setSearchId={setSearchId} handleSearchClient={handleSearchClient}
        selectedClient={selectedClient} handleNewVehicle={() => setIsNewVehicleModalOpen(true)}
        dateFrom={dateFrom} setDateFrom={(val) => { setDateFrom(val); setPage(0); }}
        dateTo={dateTo} setDateTo={(val) => { setDateTo(val); setPage(0); }}
        onClearSearch={() => {
          setSearchId('');
          setSelectedClient(null);
          setSelectedPlate(undefined);
          setDateFrom(format(new Date(), 'yyyy-MM-dd'));
          setDateTo(format(new Date(), 'yyyy-MM-dd'));
          setPage(0);
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-64 shrink-0">
          <VehicleList 
            records={records} selectedPlate={selectedPlate} 
            onSelectPlate={(plate) => setSelectedPlate(plate)} 
          />
          
          {Math.ceil(totalCount / pageSize) > 1 && (
            <div className="mt-4 flex flex-col gap-2 p-4 bg-[var(--modal-bg)] rounded-3xl border border-[var(--border-main)] card-shadow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Pág {page + 1} de {Math.ceil(totalCount / pageSize)}</span>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{totalCount} registros</span>
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="flex-1 py-2 text-[10px] font-black border border-[var(--border-main)] rounded-xl disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest active:scale-95"
                >
                  Anterior
                </button>
                <button 
                  disabled={page >= Math.ceil(totalCount / pageSize) - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="flex-1 py-2 text-[10px] font-black border border-[var(--border-main)] rounded-xl disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest active:scale-95"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 w-full min-w-0 space-y-4">
          {selectedPlate ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--emphasis-color)]" /> Historial de Placa: <span className="text-[var(--text-main)] font-black">{selectedPlate}</span>
                </h3>
                <button 
                  onClick={handleAddModule} 
                  disabled={addHistoryMutation.isPending}
                  className="text-[10px] font-black bg-[var(--emphasis-color)] text-white px-5 py-2 rounded-full hover:opacity-90 flex items-center gap-2 uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addHistoryMutation.isPending ? 'Iniciando...' : 'Nuevo Servicio'}
                </button>
              </div>

              <div className="space-y-4">
                {selectedPlateRecords
                  .flatMap(r => (r.history || []).filter(Boolean).map(m => ({ ...m, recordId: r.id, clientId: r.clientId })))
                  .sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map(m => {
                    const { recordId, clientId, ...moduleData } = m;
                    return (
                      <MaintenanceModule 
                        key={m.id} module={moduleData as MaintenanceHistory} inventory={inventory} hasActionPermission={hasActionPermission}
                        clientInfo={selectedClient ? { name: selectedClient.name, idNumber: selectedClient.idNumber } : clientCache[clientId]}
                        onUpdate={(data) => handleUpdateModule(recordId, m.id, data)}
                        onDelete={() => setModuleToDelete({ recordId: recordId, moduleId: m.id })}
                        onOpenPhotos={() => { setActiveModuleId(m.id); setIsPhotoModalOpen(true); }}
                        onPrint={() => handlePrintServiceOrder(moduleData as MaintenanceHistory, recordId)}
                      />
                    );
                  })
                }
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[var(--modal-bg)] rounded-[3rem] border border-dashed border-[var(--border-main)] min-h-[450px] card-shadow overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--emphasis-color)] to-transparent opacity-20"></div>
              <div className="bg-zinc-100 dark:bg-zinc-900/50 p-8 rounded-full mb-8 transform hover:rotate-12 transition-transform duration-500">
                <Car className="w-16 h-16 text-[var(--emphasis-color)] opacity-40" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">
                {selectedClient ? 'LISTO PARA TRABAJAR' : 'VISTA DIARIA DE TALLER'}
              </h3>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-3 max-w-xs mx-auto leading-relaxed opacity-80">
                {selectedClient 
                  ? `Historial de ${selectedClient.name.split(' ')[0]} · ${dateFrom} → ${dateTo}`
                  : `Monitoreando ingresos desde ${dateFrom} hasta ${dateTo}`}
              </p>
              {records.length === 0 && !maintenanceQuery.isLoading && (
                <div className="mt-10 bg-zinc-50 dark:bg-zinc-900/40 px-8 py-5 rounded-[2rem] border border-[var(--border-main)] border-dashed">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[0.2em]">Cero registros en este periodo</p>
                </div>
              )}
              {maintenanceQuery.isLoading && (
                <div className="mt-10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--emphasis-color)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[var(--emphasis-color)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-[var(--emphasis-color)] rounded-full animate-bounce"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-[var(--modal-bg)] rounded-[40px] p-10 w-full max-w-md animate-in zoom-in duration-300 card-shadow border border-[var(--border-main)] text-center">
            <div className="inline-flex bg-[var(--emphasis-color)] p-4 rounded-3xl mb-6">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter italic mb-2">Nuevo Ingreso</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-8">Asigna una placa para iniciar el servicio</p>
            
            <form onSubmit={handleNewVehicle} className="space-y-6">
              <input 
                autoFocus type="text" placeholder="PLACA (Ej: JOS22E)" value={newVehiclePlate} 
                onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border-main)] rounded-[2rem] text-center text-3xl font-black uppercase tracking-widest focus:border-zinc-900 transition-colors outline-none"
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsNewVehicleModalOpen(false)} className="flex-1 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={createVehicleMutation.isPending || !newVehiclePlate.trim()}
                  className="flex-1 bg-[var(--emphasis-color)] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
                >
                  {createVehicleMutation.isPending ? 'PROCESANDO...' : 'REGISTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPhotoModalOpen && activeModule && activeRecord && (
        <PhotoGalleryModal 
          photos={activeModule.photos || []} isClosed={activeModule.status === 'closed'}
          isUploading={isUploadingPhotos} onClose={() => setIsPhotoModalOpen(false)}
          onUpload={(e) => handlePhotoUpload(e, activeRecord.id, activeModule.id)}
          onDelete={(idx) => {
            const newPhotos = [...(activeModule.photos || [])];
            newPhotos.splice(idx, 1);
            handleUpdateModule(activeRecord.id, activeModule.id, { photos: newPhotos });
          }}
        />
      )}

      <ConfirmModal 
        isOpen={!!moduleToDelete}
        title="Eliminar Servicio" 
        message="¿Estás seguro de eliminar este registro de mantenimiento? Esta acción es irreversible."
        onConfirm={handleDeleteModule} onCancel={() => setModuleToDelete(null)}
      />

      {/* Hidden Printable Area */}
      <div id="printable-area" style={{ display: 'none' }} className="print:block">
        {printSnapshot && (
          <ServiceOrderFormat {...printSnapshot} />
        )}
      </div>
    </div>
  );
}
