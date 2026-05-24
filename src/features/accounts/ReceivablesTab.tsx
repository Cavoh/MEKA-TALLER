import React, { useState, useContext } from 'react';
import { WorkshopContext } from '../../context/WorkshopContext';
import { format } from 'date-fns';
import { Search, Plus, X, DollarSign, CheckCircle2 } from 'lucide-react';
import ReceiptPrintModal from '../../components/ReceiptPrintModal';
import { useToast } from '../../components/ToastProvider';

// React Query Hooks
import { 
  useReceivables, 
  useNextReceiptNumber, 
  useAddReceivablePayment 
} from '../../hooks/queries/useAccountsQuery';

export default function ReceivablesTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showError, showSuccess } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Modals state
  const [selectedReceivable, setSelectedReceivable] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [printPayload, setPrintPayload] = useState<any | null>(null);

  // React Query: Fetching
  const { data: receivables = [], isLoading } = useReceivables(tenant?.id || '');
  const { data: currentReceiptNo } = useNextReceiptNumber(tenant?.id || '', 'RC');

  // React Query: Mutation
  const addPaymentMutation = useAddReceivablePayment();

  const handlePayment = async () => {
    if (!tenant || !selectedReceivable || !paymentAmount || paymentAmount <= 0 || !currentReceiptNo) return;
    
    try {
      const paymentData = await addPaymentMutation.mutateAsync({
        tenant_id: tenant.id,
        receivable_id: selectedReceivable.id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        notes: paymentNotes,
        "RC No.": currentReceiptNo
      });
      
      setPrintPayload({
        ...paymentData,
        clientName: selectedReceivable.client?.name,
        clientIdNumber: selectedReceivable.client?.id_number,
        invoiceNumber: selectedReceivable.invoice?.invoice_number,
        total_amount: selectedReceivable.total_amount,
        paid_amount: selectedReceivable.paid_amount,
      });

      setSelectedReceivable(null);
      setPaymentAmount('');
      setPaymentNotes('');
      showSuccess('Abono Registrado', 'El pago se ha procesado correctamente.');
    } catch (err: any) {
      showError('Error al procesar abono', err.message);
    }
  };

  const filtered = receivables.filter(r => 
    r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.client?.id_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar mb-4 bg-[var(--modal-bg)]/30 p-2 rounded-full border border-[var(--border-main)] card-shadow">
        <div className="flex items-center gap-2 shrink-0 px-2">
          <div className="relative bg-[var(--pill-bg)] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)] hover:border-zinc-400 transition-colors">
            <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Desde</span>
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-[var(--text-main)] outline-none w-[100px] sm:w-[110px] cursor-pointer"
            />
          </div>

          <div className="relative bg-[var(--pill-bg)] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-[var(--border-main)] hover:border-zinc-400 transition-colors">
            <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Hasta</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-[var(--text-main)] outline-none w-[100px] sm:w-[110px] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-2xl px-2">
          <div className="relative flex-1">
            <div className="flex gap-2 bg-[var(--pill-bg)] border border-[var(--border-main)] rounded-full p-1.5 shadow-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 bg-transparent outline-none text-xs font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] uppercase"
                placeholder="BUSCAR POR CLIENTE O DOC..."
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="px-2 text-zinc-400 hover:text-zinc-600"><X className="w-3 h-3" /></button>
              )}
              <button className="bg-[var(--emphasis-color)] text-white p-1.5 rounded-full hover:opacity-90 transition-colors shrink-0">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--modal-bg)] rounded-3xl border border-[var(--border-main)] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b border-[var(--border-main)]">
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fecha / Vence</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Factura</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Deuda Inicial</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Abonado</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Saldo</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const total = Number(r.total_amount);
                const paid = Number(r.paid_amount);
                const isPaid = r.status === 'PAID';
                
                return (
                  <tr 
                    key={r.id} 
                    className={`transition-colors group border-b border-[var(--border-main)] ${
                      r.due_date && new Date(r.due_date) < new Date()
                        ? 'bg-red-500/10 hover:bg-red-500/[0.15]'
                        : 'hover:bg-[var(--table-row-hover)]'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 text-[11px] font-bold text-[var(--text-main)] uppercase">
                        <div>CRE: {format(new Date(r.created_at), 'dd/MM/yyyy')}</div>
                        <div className={`${new Date(r.due_date) < new Date() && !isPaid ? 'text-red-500 font-black' : 'text-zinc-500'}`}>
                          VENCE: {r.due_date ? format(new Date(r.due_date), 'dd/MM/yyyy') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-black text-[var(--text-main)] uppercase">{r.client?.name || '---'}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{r.client?.id_number}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[11px] font-black tracking-widest text-[var(--text-main)] bg-[var(--modal-bg)] inline-flex px-2 py-1 rounded-md border border-[var(--border-main)]">
                        {r.invoice?.invoice_number || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-xs font-black text-[var(--text-main)]">
                        ${total.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-xs font-black text-emerald-500">
                        ${paid.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-xs font-black text-red-500">
                        ${(total - paid).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isPaid ? 'bg-emerald-500/20 text-emerald-500' :
                        r.status === 'PARTIAL' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {r.status === 'PAID' ? 'PAGADO' : r.status === 'PARTIAL' ? 'ABONOS' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isPaid && (
                        <button
                          onClick={() => setSelectedReceivable(r)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-xl transition-colors shrink-0"
                          title="Abonar Pago"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs font-black text-zinc-500 uppercase tracking-widest">
                    No hay cuentas por cobrar registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReceivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-[var(--modal-bg)] rounded-[32px] card-shadow w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200 border border-[var(--border-main)]">
            <button onClick={() => setSelectedReceivable(null)} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><X className="w-5 h-5"/></button>
            <div className="absolute top-6 right-16">
              <span className="bg-[var(--table-header-bg)] border border-[var(--border-main)] px-3 py-1.5 rounded-lg text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest shadow-sm">
                {currentReceiptNo || 'RC No...'}
              </span>
            </div>
            
            <div className="mb-8 mt-2">
              <div className="inline-flex bg-zinc-900 p-4 rounded-[1.5rem] mb-4">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">RECIBO DE CAJA</h3>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold mt-1">
                Cliente: {selectedReceivable.client?.name}
              </p>
            </div>

            <div className="space-y-5">
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Saldo Pendiente</span>
                <span className="text-lg font-black text-red-500">${(Number(selectedReceivable.total_amount) - Number(selectedReceivable.paid_amount)).toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-2">Monto a Abonar</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    max={Number(selectedReceivable.total_amount) - Number(selectedReceivable.paid_amount)}
                    className="w-full bg-[var(--table-header-bg)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-base font-black text-[var(--text-main)] focus:border-zinc-900 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      paymentMethod === m 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : 'bg-transparent border-[var(--border-main)] text-[var(--text-muted)] hover:border-zinc-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-2">Observaciones</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-[var(--table-header-bg)] border border-[var(--border-main)] rounded-2xl p-4 text-xs font-bold text-[var(--text-main)] focus:border-zinc-900 outline-none transition-colors resize-none h-24"
                  placeholder="Detalles del abono..."
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={addPaymentMutation.isPending || !paymentAmount}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {addPaymentMutation.isPending ? 'REGISTRANDO...' : 'CONFIRMAR ABONO'}
                {!addPaymentMutation.isPending && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {printPayload && (
        <ReceiptPrintModal 
          type="RC" 
          payload={printPayload} 
          onClose={() => setPrintPayload(null)} 
        />
      )}
    </div>
  );
}
