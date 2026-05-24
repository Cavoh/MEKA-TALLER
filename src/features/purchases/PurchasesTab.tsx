import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { Supplier, InvoiceItem } from '../../types';
import { X, DollarSign, CreditCard } from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';
import { useToast } from '../../components/ToastProvider';

// Subcomponentes del Feature
import { SupplierSection } from './SupplierSection';
import { PurchaseFormTable } from './PurchaseFormTable';
import { PurchaseSummary } from './PurchaseSummary';
import { InvoiceFormat } from '../invoicing/InvoiceFormat';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

// React Query Hooks
import { useInventory } from '../../hooks/queries/useInventoryQuery';
import { 
  useNextShippingNumber, 
  useSavePurchase, 
  useCreateSupplier, 
  useSupplierById 
} from '../../hooks/queries/usePurchasesQuery';

export default function PurchasesTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError, showInfo } = useToast();
  
  // Estados Locales
  const [searchId, setSearchId] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewSupplierForm, setIsNewSupplierForm] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, price: 0, discount: 0, iva: 0, total: 0 }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [printSnapshot, setPrintSnapshot] = useState<any>(null);
  const [creditDays, setCreditDays] = useState('30');
  const [newSupplierData, setNewSupplierData] = useState({
    name: '', phone: '', email: '', address: '', idType: 'NIT', idNumber: '', discount: 0, retefuente: 0, reteica: 0
  });

  // React Query: Fetching
  const { data: inventoryData } = useInventory(tenant?.id || '', '', 0, 1000); // Traer todo para autocompletar
  const { data: nextNumber = '000001', isLoading: isNumLoading } = useNextShippingNumber(tenant?.id || '');
  
  // React Query: Mutations
  const savePurchaseMutation = useSavePurchase();
  const createSupplierMutation = useCreateSupplier();

  const handleSearchSupplier = async () => {
    if (!tenant || !searchId) return;
    try {
      const supplier = await purchaseService.searchSupplier(tenant.id, searchId);
      if (supplier) {
        setSelectedSupplier(supplier);
        setIsNewSupplierForm(false);
      } else {
        setIsNewSupplierForm(true);
        setSelectedSupplier(null);
        setNewSupplierData({ ...newSupplierData, idNumber: searchId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateItem = (idx: number, data: Partial<InvoiceItem>) => {
    const newItems = [...purchaseItems];
    newItems[idx] = { ...newItems[idx], ...data };
    const it = newItems[idx];
    const rawSubtotal = it.quantity * it.price;
    const taxableBase = rawSubtotal - (rawSubtotal * (it.discount / 100));
    it.total = taxableBase + (taxableBase * (it.iva / 100));
    setPurchaseItems(newItems);
  };

  const handleAddRow = (focusNewRow = false) => {
    const lastItem = purchaseItems[purchaseItems.length - 1];
    if (lastItem.description.trim() !== '' || lastItem.sku) {
      const currentLength = purchaseItems.length;
      setPurchaseItems([...purchaseItems, { description: '', quantity: 1, price: 0, discount: 0, iva: 0, total: 0 }]);
      if (focusNewRow) {
        setTimeout(() => {
          const el = document.getElementById(`quantity-input-purchase-${currentLength}`);
          if(el) {
            el.focus();
            (el as HTMLInputElement).select();
          }
        }, 50);
      }
    }
  };

  const subtotal = purchaseItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const totalDiscount = purchaseItems.reduce((acc, item) => acc + (item.quantity * item.price * (item.discount / 100)), 0);
  const taxableBaseValue = subtotal - totalDiscount;
  const ivaTotal = purchaseItems.reduce((acc, item) => {
    const base = (item.quantity * item.price) * (1 - item.discount / 100);
    return acc + (base * (item.iva / 100));
  }, 0);
  const total = subtotal - totalDiscount + ivaTotal;

  const handlePrintAndSave = async (paymentMethod: string) => {
    if (!tenant || savePurchaseMutation.isPending) return;
    
    const filteredItems = purchaseItems.filter(item => item.description.trim() !== '' || (item.sku && item.sku.trim() !== ''));
    if (filteredItems.length === 0) {
      showInfo('Sin ítems', 'Agrega al menos un producto válido.');
      return;
    }

    if (!selectedSupplier && !isNewSupplierForm) {
      showInfo('Proveedor Requerido', 'Debes seleccionar o crear un proveedor.');
      setShowPaymentModal(false);
      return;
    }

    try {
      let sId = selectedSupplier?.id;
      let sData = selectedSupplier;

      if (isNewSupplierForm) {
        const s = await createSupplierMutation.mutateAsync({ tenantId: tenant.id, supplierData: newSupplierData });
        sId = s.id;
        sData = s;
      }
      
      if (!sId) throw new Error('No se pudo determinar el ID del proveedor.');

      await savePurchaseMutation.mutateAsync({
        tenantId: tenant.id,
        supplierId: sId,
        invoiceNumber: nextNumber,
        date: new Date().toISOString(),
        items: filteredItems,
        subtotal,
        totalDiscount,
        taxableBase: taxableBaseValue,
        ivaTotal,
        total,
        paymentMethod
      });

      setPrintSnapshot({
        tenant,
        client: sData || newSupplierData,
        invoiceNumber: nextNumber,
        items: filteredItems,
        subtotal,
        totalDiscount,
        taxableBase: taxableBaseValue,
        ivaTotal,
        total,
        paymentMethod,
        isPurchase: true
      });

      setTimeout(() => {
        window.print();
        setPurchaseItems([{ description: '', quantity: 1, price: 0, discount: 0, iva: 0, total: 0 }]);
        setSelectedSupplier(null); 
        setIsNewSupplierForm(false); 
        setSearchId(''); 
        setShowPaymentModal(false);
        showSuccess('Compra Guardada', 'La compra se ha registrado y el stock se ha actualizado.');
      }, 500);
      
    } catch (err: any) {
      showError('Error al Guardar', err.message || 'No se pudo guardar la compra.');
    }
  };

  const isSaving = savePurchaseMutation.isPending || createSupplierMutation.isPending;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 space-y-6">
          <SupplierSection 
            searchId={searchId} setSearchId={setSearchId} onSearch={handleSearchSupplier} 
            selectedSupplier={selectedSupplier} onClearSupplier={() => setSelectedSupplier(null)}
            isNewForm={isNewSupplierForm} newData={newSupplierData} setNewData={setNewSupplierData}
          />
          
          <PurchaseSummary 
            subtotal={subtotal} 
            totalDiscount={totalDiscount} 
            plusTax={ivaTotal} 
            total={total}
            onSave={() => setShowPaymentModal(true)}
            isSaving={isSaving}
          />
        </div>

        <div className="xl:col-span-8">
          <PurchaseFormTable 
            items={purchaseItems} 
            inventory={inventoryData?.data || []} 
            onRemoveItem={(idx) => setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))}
            onUpdateItem={updateItem}
            shippingNumber={nextNumber}
            onAddRow={handleAddRow}
          />
        </div>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="FORMA DE PAGO"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Button
            onClick={() => handlePrintAndSave('EFECTIVO')}
            isLoading={isSaving}
            className="w-full bg-[#f0f5ff] hover:bg-[#e6edff] dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-[var(--text-main)] py-8 rounded-2xl flex items-center justify-between px-8 border-none"
          >
            <span className="text-lg font-black uppercase tracking-wider">
              {isSaving ? 'GUARDANDO...' : 'EFECTIVO'}
            </span>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            {['TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA'].map(m => (
              <Button
                key={m}
                variant="secondary"
                onClick={() => handlePrintAndSave(m)}
                isLoading={isSaving}
                className="flex flex-col items-center justify-center gap-2 min-h-[100px] rounded-2xl"
              >
                <CreditCard className="w-6 h-6 text-blue-400" />
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
              onClick={() => handlePrintAndSave(`CREDITO_${creditDays}`)}
              isLoading={isSaving}
              className="px-8 rounded-none bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white"
            >
              {isSaving ? '...' : 'APLICAR'}
            </Button>
          </div>
        </div>
      </Modal>

      <div id="printable-invoice">
        {printSnapshot && <InvoiceFormat {...printSnapshot} />}
      </div>
    </div>
  );
}
