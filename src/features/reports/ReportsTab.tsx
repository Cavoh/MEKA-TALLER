import React, { useState, useEffect, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { ArqueoCaja, UnifiedTransaction } from '../../types';
import { format, parseISO, startOfDay } from 'date-fns';
import { InvoiceFormat } from '../invoicing/InvoiceFormat';
import ReceiptPrintModal from '../../components/ReceiptPrintModal';
import AperturaCajaModal, { BaseMontos } from '../../components/AperturaCajaModal';
import CierreCajaModal from '../../components/CierreCajaModal';
import { useToast } from '../../components/ToastProvider';
import { useSearchPagination } from '../../hooks/useSearchPagination';

// Subcomponentes del Feature
import { DailyReportHeader } from './DailyReportHeader';
import { TransactionTable } from './TransactionTable';

// React Query Hooks
import { 
  useUnifiedTransactions, 
  useCurrentCashRegister, 
  useOpenCashRegister, 
  useCloseCashRegister 
} from '../../hooks/queries/useReportsQuery';

export default function ReportsTab() {
  const { tenant, user } = useContext(WorkshopContext);
  const { showSuccess, showError } = useToast();
  
  const { page, setPage, pageSize } = useSearchPagination(50, 0);
  
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mechanicFilter, setMechanicFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [printSnapshot, setPrintSnapshot] = useState<any>(null);
  const [receiptPrintPayload, setReceiptPrintPayload] = useState<{ type: 'RC' | 'CE', payload: any } | null>(null);

  const [isAperturaModalOpen, setIsAperturaModalOpen] = useState(false);
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);

  // React Query: Fetching
  const { 
    data: transactionsData, 
    isLoading: isLoadingData 
  } = useUnifiedTransactions(tenant?.id || '', dateFrom, dateTo);

  const { 
    data: cajaAbierta, 
    isLoading: isLoadingCash 
  } = useCurrentCashRegister(tenant?.id || '');

  // React Query: Mutations
  const openCashMutation = useOpenCashRegister();
  const closeCashMutation = useCloseCashRegister();

  const handlePrint = (tx: UnifiedTransaction) => {
    if (tx.sourceType === 'FACTURA') {
      const inv = tx.originalPayload;
      setReceiptPrintPayload(null);
      setPrintSnapshot({
        tenant, client: { name: inv.clientName, phone: inv.client_phone, email: inv.client_email, address: inv.client_address, idType: inv.client_id_type, idNumber: inv.client_id_number, discount: inv.client_discount },
        invoiceNumber: inv.invoice_number, items: inv.items || [], subtotal: Number(inv.subtotal), totalDiscount: Number(inv.discount), taxableBase: Number(inv.taxable_base), ivaTotal: Number(inv.iva_total), total: Number(inv.total), paymentMethod: inv.payment_type || 'EFECTIVO', mechanic: inv.mechanic
      });
      setTimeout(() => window.print(), 500);
    } else if (tx.sourceType === 'ABONO CXC') {
      setPrintSnapshot(null);
      setReceiptPrintPayload({ type: 'RC', payload: tx.originalPayload });
    } else if (tx.sourceType === 'PAGO CXP') {
      setPrintSnapshot(null);
      setReceiptPrintPayload({ type: 'CE', payload: tx.originalPayload });
    }
  };

  const filteredTransactions = (transactionsData?.master || []).filter(tx => {
    const matchesMechanic = mechanicFilter === 'all' || tx.mechanic === mechanicFilter;
    const matchesPayment = paymentFilter === 'all' || tx.paymentMethod === paymentFilter;
    return matchesMechanic && matchesPayment;
  });

  const totalSalesAmount = filteredTransactions.filter(tx => tx.sourceType === 'FACTURA').reduce((acc, tx) => acc + tx.total, 0);
  const uniqueMechanics = Array.from(new Set((transactionsData?.master || []).map(tx => tx.mechanic))).filter(Boolean).sort() as string[];
  const uniquePayments = Array.from(new Set((transactionsData?.master || []).map(tx => tx.paymentMethod))).filter(Boolean).sort() as string[];

  const getBasesFromCaja = (): BaseMontos => {
    if (!cajaAbierta) return { efectivo: 0, tarjetaDebito: 0, tarjetaCredito: 0, nequi: 0, daviplata: 0 };
    return { efectivo: Number(cajaAbierta.apertura_efectivo) || 0, tarjetaDebito: Number(cajaAbierta.apertura_tarjeta_debito) || 0, tarjetaCredito: Number(cajaAbierta.apertura_tarjeta_credito) || 0, nequi: Number(cajaAbierta.apertura_nequi) || 0, daviplata: Number(cajaAbierta.apertura_daviplata) || 0, credito: 0, abonos_cxc: 0, abonos_cxp: 0 };
  };

  const currentVentas = (() => {
    if (!cajaAbierta || !transactionsData) return { efectivo: 0, tarjetaDebito: 0, tarjetaCredito: 0, nequi: 0, daviplata: 0, credito: 0, abonos_cxc: 0, abonos_cxp: 0 };
    const aperturaDate = new Date(cajaAbierta.fecha_apertura);
    let res = { efectivo: 0, tarjetaDebito: 0, tarjetaCredito: 0, nequi: 0, daviplata: 0, credito: 0, abonos_cxc: 0, abonos_cxp: 0 };
    
    // Filtrar localmente lo que pertenece a esta sesión de caja
    const facturas = transactionsData.invoices.filter((inv: any) => new Date(inv.date) >= aperturaDate);
    const compras = transactionsData.shippings.filter((ship: any) => new Date(ship.date) >= aperturaDate);
    const recibosCxc = transactionsData.receivablePayments.filter((p: any) => new Date(p.payment_date) >= aperturaDate);
    const pagosCxp = transactionsData.payablePayments.filter((p: any) => new Date(p.payment_date) >= aperturaDate);

    const proc = (method: string, amt: number, isIng: boolean) => {
      const p = (method || 'EFECTIVO').toUpperCase().trim();
      if (p.startsWith('CREDITO')) return;
      let target: keyof BaseMontos = 'efectivo';
      if (p.includes('DEBITO') || p.includes('TRANSFERENCIA')) target = 'tarjetaDebito';
      else if (p.includes('CREDITO') || p === 'TARJETA') target = 'tarjetaCredito';
      else if (p === 'NEQUI') target = 'nequi';
      else if (p === 'DAVIPLATA') target = 'daviplata';
      (res as any)[target] += isIng ? amt : -amt;
    };

    facturas.forEach((inv: any) => {
      if ((inv.payment_type || '').toUpperCase().startsWith('CREDITO')) res.credito += Number(inv.total);
      else proc(inv.payment_type || 'EFECTIVO', Number(inv.total), true);
    });
    recibosCxc.forEach((p: any) => { res.abonos_cxc += Number(p.amount); proc(p.payment_method, Number(p.amount), true); });
    compras.forEach((s: any) => proc(s.payment_method, Number(s.total), false));
    pagosCxp.forEach((p: any) => { res.abonos_cxp += Number(p.amount); proc(p.payment_method, Number(p.amount), false); });
    
    return res;
  })();

  const handleCajaAction = () => {
    if (cajaAbierta) {
      if (cajaAbierta.fecha_apertura) {
        const apertura = startOfDay(new Date(cajaAbierta.fecha_apertura));
        if (apertura < startOfDay(parseISO(dateFrom))) {
           const newDate = format(apertura, 'yyyy-MM-dd');
           setDateFrom(newDate); setDateTo(newDate); setPage(0);
           showSuccess('Sincronizando Fechas', 'Ajustamos el filtro para incluir todos los movimientos pendientes.');
        }
      }
      setIsCierreModalOpen(true);
    } else setIsAperturaModalOpen(true);
  };

  const handleConfirmApertura = async (bases: BaseMontos) => {
    if (!tenant) return;
    try {
      await openCashMutation.mutateAsync({ 
        tenant_id: tenant.id, 
        usuario_id: user.id || tenant.id, 
        apertura_efectivo: bases.efectivo, 
        apertura_tarjeta_debito: bases.tarjetaDebito, 
        apertura_tarjeta_credito: bases.tarjetaCredito, 
        apertura_nequi: bases.nequi, 
        apertura_daviplata: bases.daviplata 
      });
      setIsAperturaModalOpen(false); 
      showSuccess('Caja Abierta', 'La caja se ha abierto correctamente.');
    } catch(e: any) { showError('Error', e.message); }
  };

  const handleConfirmCierre = async (reales: BaseMontos, obs: string) => {
    if (!tenant || !cajaAbierta) return;
    try {
      const bases = getBasesFromCaja();
      const totalEsperado = Object.values(bases).reduce((a, b) => a + b, 0) + Object.values(currentVentas).reduce((a, b) => a + b, 0) - currentVentas.credito - currentVentas.abonos_cxc - currentVentas.abonos_cxp;
      const totalFisico = reales.efectivo + reales.tarjetaDebito + reales.tarjetaCredito + reales.nequi + reales.daviplata;
      
      await closeCashMutation.mutateAsync({
        id: cajaAbierta.id,
        tenantId: tenant.id,
        data: { ...currentVentas, cierre_efectivo: reales.efectivo, cierre_tarjeta_debito: reales.tarjetaDebito, cierre_tarjeta_credito: reales.tarjetaCredito, cierre_nequi: reales.nequi, cierre_daviplata: reales.daviplata, diferencia_total: totalFisico - totalEsperado, observaciones: obs }
      });
      setIsCierreModalOpen(false); 
      showSuccess('Caja Cerrada', 'La caja se ha cerrado exitosamente.');
    } catch(e: any) { showError('Error', e.message); }
  };

  const isSavingCash = openCashMutation.isPending || closeCashMutation.isPending;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <DailyReportHeader 
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        currentTotalCount={filteredTransactions.length} totalSalesAmount={totalSalesAmount}
        mechanicFilter={mechanicFilter} setMechanicFilter={setMechanicFilter} uniqueMechanics={uniqueMechanics}
        paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} uniquePayments={uniquePayments}
        cajaAbierta={cajaAbierta} onCajaAction={handleCajaAction}
      />

      <TransactionTable 
        transactions={filteredTransactions} isLoading={isLoadingData} 
        page={page} pageSize={pageSize} setPage={setPage} onPrint={handlePrint}
      />

      {printSnapshot && (
        <div id="printable-invoice">
          <InvoiceFormat {...printSnapshot} />
        </div>
      )}

      {receiptPrintPayload && (
        <ReceiptPrintModal type={receiptPrintPayload.type} payload={receiptPrintPayload.payload} onClose={() => setReceiptPrintPayload(null)} />
      )}

      <AperturaCajaModal isOpen={isAperturaModalOpen} onClose={() => setIsAperturaModalOpen(false)} onConfirm={handleConfirmApertura} isSaving={isSavingCash} />
      <CierreCajaModal isOpen={isCierreModalOpen} onClose={() => setIsCierreModalOpen(false)} onConfirm={handleConfirmCierre} bases={getBasesFromCaja()} ventas={currentVentas} fechaApertura={cajaAbierta?.fecha_apertura} isSaving={isSavingCash} />
    </div>
  );
}
