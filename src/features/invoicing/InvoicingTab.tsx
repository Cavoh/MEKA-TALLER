import React, { useState, useContext, useEffect } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { InvoiceItem, Client } from '../../types';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../components/ToastProvider';

// Feature-local components
import { InvoiceClientSection } from './InvoiceClientSection';
import { InvoiceItemTable } from './InvoiceItemTable';
import { InvoiceSummary } from './InvoiceSummary';
import { InvoiceFormat } from './InvoiceFormat';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DollarSign, CreditCard } from 'lucide-react';

// Hooks
import { useInventory } from '../../hooks/queries/useInventoryQuery';
import { usePersonnel } from '../../hooks/queries/usePersonnelQuery';
import { useOpenMaintenanceModules, useSaveInvoice } from '../../hooks/queries/useInvoicingQuery';
import { useCurrentCashRegister } from '../../hooks/queries/useReportsQuery';

export default function InvoicingTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError, showInfo } = useToast();

  // State
  const [searchId, setSearchId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientForm, setIsNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '', idType: 'CC', idNumber: '', phone: '', email: '', address: '', discount: 0
  });

  const [serviceModuleId, setServiceModuleId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0, discount: 0, iva: 19, total: 0 }]);
  const [paymentType, setPaymentType] = useState('EFECTIVO');
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [creditDays, setCreditDays] = useState('30');
  const [printSnapshot, setPrintSnapshot] = useState<any>(null);

  // Queries
  const { data: inventoryData } = useInventory(tenant?.id || '', '', 0, 1000);
  const inventory = inventoryData?.data || [];
  const { data: personnel = [] } = usePersonnel(tenant?.id || '');
  const { data: clientModules = [] } = useOpenMaintenanceModules(tenant?.id || '', selectedClient?.id || '');
  const { data: cajaAbierta } = useCurrentCashRegister(tenant?.id || '');
  
  // mutation
  const saveInvoiceMutation = useSaveInvoice();

  const handleSearchClient = async () => {
    if (!tenant || !searchId) return;
    try {
      const client = await invoiceService.searchClientById(tenant.id, searchId);
      if (client) {
        setSelectedClient(client);
        setIsNewClientForm(false);
        showSuccess('Cliente Encontrado', client.name);
      } else {
        setIsNewClientForm(true);
        setNewClientData({ ...newClientData, idNumber: searchId });
        setSelectedClient(null);
        showInfo('Nuevo Cliente', 'Complete los datos para continuar');
      }
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleLoadFromModule = async () => {
    if (!tenant || !serviceModuleId) return;
    setIsModuleLoading(true);
    try {
      const mod = await invoiceService.getMaintenanceModuleDetails(tenant.id, serviceModuleId);
      if (mod) {
        const history = typeof mod.history === 'string' ? JSON.parse(mod.history) : mod.history;
        const loadedItems = invoiceService.processMaintenanceItems(history, inventory, selectedClient?.discount || 0);
        setItems(loadedItems);
        if (mod.mecanico) setSelectedMechanic(mod.mecanico);
        showSuccess('Ítems Cargados', `Placa: ${mod.vehicle_plate}`);
      }
    } catch (err: any) {
      showError('Error al cargar módulo', err.message);
    } finally {
      setIsModuleLoading(false);
    }
  };

  const updateItem = (idx: number, data: Partial<InvoiceItem>) => {
    const newItems = [...items];
    const discountToApply = data.discount !== undefined ? data.discount : newItems[idx].discount;
    const priceToApply = data.price !== undefined ? data.price : newItems[idx].price;
    const qtyToApply = data.quantity !== undefined ? data.quantity : newItems[idx].quantity;
    
    newItems[idx] = { ...newItems[idx], ...data };
    newItems[idx].total = (qtyToApply * priceToApply) * (1 - discountToApply / 100);
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) {
      setItems([{ description: '', quantity: 1, price: 0, discount: 0, iva: 19, total: 0 }]);
    } else {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.quantity * item.price * (item.discount / 100)), 0);
    const ivaTotal = items.reduce((sum, item) => {
      const baseConDesc = (item.quantity * item.price) * (1 - item.discount / 100);
      return sum + (baseConDesc * (item.iva / 100));
    }, 0);
    const total = (subtotal - totalDiscount) + ivaTotal;

    return { subtotal, discount: totalDiscount, iva: ivaTotal, total };
  };

  const handleSaveInvoice = async (method: string) => {
    if (!tenant) return;
    setPaymentType(method);

    // VALIDACIÓN DE CAJA (Requerido por el usuario)
    if (!cajaAbierta) {
      showError('Caja Cerrada', 'Debe abrir la caja para facturar');
      return;
    }

    const totals = calculateTotals();
    
    if (!selectedClient && !isNewClientForm) {
      showError('Validación', 'Debe seleccionar o crear un cliente');
      return;
    }

    const filteredItems = items.filter(i => i.description.trim() !== '');
    if (filteredItems.length === 0) {
      showError('Validación', 'Debe agregar al menos un ítem con descripción');
      return;
    }

    try {
      await saveInvoiceMutation.mutateAsync({
        tenant,
        clientId: selectedClient?.id || '',
        clientInfo: selectedClient || newClientData,
        invoiceNumber: invoiceService.generateInvoiceNumber(tenant),
        items: filteredItems,
        totals,
        paymentType,
        mechanic: selectedMechanic,
        maintenanceId: serviceModuleId || undefined
      });

      setPrintSnapshot({
        tenant,
        client: selectedClient || newClientData,
        invoiceNumber: invoiceService.generateInvoiceNumber(tenant),
        items: filteredItems,
        subtotal: totals.subtotal,
        totalDiscount: totals.discount,
        taxableBase: totals.subtotal - totals.discount,
        ivaTotal: totals.iva,
        total: totals.total,
        paymentMethod: method,
        mechanic: selectedMechanic
      });

      setTimeout(() => {
        window.print();
        // Reset
        setSelectedClient(null);
        setSearchId('');
        setIsNewClientForm(false);
        setServiceModuleId('');
        setItems([{ description: '', quantity: 1, price: 0, discount: 0, iva: 19, total: 0 }]);
        setShowPaymentModal(false);
        setPrintSnapshot(null);
        showSuccess('Éxito', 'Factura procesada correctamente');
      }, 500);
    } catch (err: any) {
      showError('Error al guardar', err.message);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 space-y-6">
          <InvoiceClientSection 
            searchId={searchId}
            setSearchId={setSearchId}
            handleSearchClient={handleSearchClient}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            isNewClientForm={isNewClientForm}
            newClientData={newClientData}
            setNewClientData={setNewClientData}
            clientModules={clientModules}
            serviceModuleId={serviceModuleId}
            setServiceModuleId={setServiceModuleId}
            handleLoadFromModule={handleLoadFromModule}
            moduleLoading={isModuleLoading}
          />

          <InvoiceSummary 
            subtotal={totals.subtotal}
            totalDiscount={totals.discount}
            ivaTotal={totals.iva}
            total={totals.total}
            taxableBase={totals.subtotal - totals.discount}
            handlePreSave={() => setShowPaymentModal(true)}
            isSaving={saveInvoiceMutation.isPending}
            paymentType={paymentType}
          />
        </div>

        <div className="xl:col-span-8 space-y-6">
          <InvoiceItemTable 
            items={items}
            inventory={inventory}
            updateItem={updateItem}
            removeItem={removeItem}
            invoiceNumber={tenant ? invoiceService.generateInvoiceNumber(tenant) : '---'}
            selectedMechanic={selectedMechanic}
            setSelectedMechanic={setSelectedMechanic}
            personnel={personnel}
            onAddRow={(focus) => {
              setItems([...items, { description: '', quantity: 1, price: 0, discount: selectedClient?.discount || 0, iva: 19, total: 0 }]);
            }}
          />
        </div>
      </div>

      <div id="printable-area" style={{ display: 'none' }} className="print:block">
        {printSnapshot && (
          <InvoiceFormat {...printSnapshot} />
        )}
      </div>
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="FORMA DE PAGO"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Button
            onClick={() => handleSaveInvoice('EFECTIVO')}
            isLoading={saveInvoiceMutation.isPending}
            className="w-full bg-[var(--pill-bg)] hover:bg-[var(--table-header-bg)] text-[var(--text-main)] py-8 rounded-2xl flex items-center justify-between px-8 border-none"
          >
            <span className="text-lg font-black uppercase tracking-wider">
              {saveInvoiceMutation.isPending ? 'GUARDANDO...' : 'EFECTIVO (CAJA)'}
            </span>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            {['TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA'].map(m => (
              <Button
                key={m}
                variant="secondary"
                onClick={() => handleSaveInvoice(m)}
                isLoading={saveInvoiceMutation.isPending}
                className="flex flex-col items-center justify-center gap-2 min-h-[100px] rounded-2xl"
              >
                <CreditCard className="w-6 h-6 text-[var(--emphasis-color)]" />
                <span className="text-[10px] font-black uppercase tracking-wider">{m}</span>
              </Button>
            ))}
          </div>

          <div className="flex bg-[var(--table-header-bg)] rounded-2xl border border-[var(--border-main)] mt-2 overflow-hidden items-stretch focus-within:ring-2 ring-[var(--emphasis-color)] transition-all">
            <select 
              value={creditDays} 
              onChange={e => setCreditDays(e.target.value)}
              className="flex-1 bg-transparent px-4 py-4 text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest outline-none border-r border-[var(--border-main)] cursor-pointer"
            >
              <option value="30">CRÉDITO A: 30 DÍAS</option>
              <option value="60">CRÉDITO A: 60 DÍAS</option>
              <option value="90">CRÉDITO A: 90 DÍAS</option>
              <option value="120">CRÉDITO A: 120 DÍAS</option>
            </select>
            <Button
              onClick={() => handleSaveInvoice(`CREDITO_${creditDays}`)}
              isLoading={saveInvoiceMutation.isPending}
              className="px-8 rounded-none bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white"
            >
              {saveInvoiceMutation.isPending ? '...' : 'APLICAR'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
