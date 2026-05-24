import React, { useContext, useEffect } from 'react';
import { WorkshopContext } from '../context/WorkshopContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ReceiptPayload {
  'RC No.'?: string;
  'CE No.'?: string;
  clientName?: string;
  clientIdNumber?: string;
  supplierName?: string;
  supplierIdNumber?: string;
  invoiceNumber?: string;
  shippingNumber?: string;
  payment_method?: string;
  total_amount: number;
  paid_amount: number;
  amount: number;
  notes?: string;
}

interface ReceiptPrintModalProps {
  type: 'RC' | 'CE';
  payload: ReceiptPayload;
  onClose: () => void;
}

export default function ReceiptPrintModal({ type, payload, onClose }: ReceiptPrintModalProps) {
  const { tenant } = useContext(WorkshopContext);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    timeout = setTimeout(() => {
      window.print();
      onClose();
    }, 150);
    return () => clearTimeout(timeout);
  }, [onClose]);

  const isRC = type === 'RC';
  const title = isRC ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO';
  const labelSubtitle = isRC ? 'Documento Oficial de Recaudo' : 'Documento Oficial de Pago';
  const docNo = isRC ? payload?.['RC No.'] : payload?.['CE No.'];
  
  const entityLabel = isRC ? 'Información del Cliente' : 'Información del Proveedor';
  const entityName = isRC ? payload?.clientName : payload?.supplierName;
  const idValue = isRC ? payload?.clientIdNumber : payload?.supplierIdNumber;
  const concept = isRC 
    ? `Factura #${payload?.invoiceNumber || 'N/A'}` 
    : `Remisión #${payload?.shippingNumber || 'N/A'}`;
  const amountLabel = isRC ? 'Total Recibido' : 'Total Pagado';

  const newBalance = Number(payload?.total_amount) - Number(payload?.paid_amount) - Number(payload?.amount);

  return (
    <div id="printable-invoice" className="bg-white p-6 text-zinc-900 font-sans max-w-[21cm] mx-auto h-[13.5cm] flex flex-col relative overflow-hidden">
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5cm;
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-4">
        <div className="flex gap-4 items-center">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center rounded-lg text-white font-black text-xl">
              MEKA
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 italic">
              {tenant?.custom_name || tenant?.name || 'MEKA TALLER'}
            </h1>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              <p>{tenant?.address}</p>
              <p>NIT: {tenant?.nit || '800-234-900-1'}</p>
              <p>CEL: {tenant?.phone}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-zinc-900 text-white px-4 py-2 rounded-xl inline-block mb-2">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{title}</p>
            <p className="text-xl font-black tracking-tighter">#{docNo}</p>
          </div>
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic block">
            {labelSubtitle}
          </p>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
          <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{entityLabel}</h3>
          <p className="text-base font-black text-zinc-900 uppercase leading-none mb-2">{entityName || '---'}</p>
          <div className="text-[10px] font-bold text-zinc-600 space-y-1">
            <p className="flex justify-between">
              <span className="text-zinc-400 uppercase">Documento:</span>
              <span>{idValue || '---'}</span>
            </p>
          </div>
        </div>
        <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
          <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Detalles de la Transacción</h3>
          <div className="text-[10px] font-bold text-zinc-600 space-y-1">
            <p className="flex justify-between border-b border-zinc-200 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest">Fecha:</span>
              <span>{format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}</span>
            </p>
            <p className="flex justify-between border-b border-zinc-200 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest">Método Pago:</span>
              <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-[8px]">{payload?.payment_method || 'EFECTIVO'}</span>
            </p>
            <p className="flex justify-between border-b border-zinc-200 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest">Concepto:</span>
              <span>{concept}</span>
            </p>
          </div>
        </div>
      </div>

      {/* If there are notes, show them compacted */}
      {payload?.notes && (
        <div className="mb-4">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Notas / Referencia:</span>
          <p className="text-[10px] font-bold text-zinc-900 bg-zinc-50 p-2 rounded-xl border border-zinc-100 uppercase">{payload.notes}</p>
        </div>
      )}

      {/* Spacer to push totals/footer down to fill exactly half sheet */}
      <div className="flex-1"></div>

      {/* Totals Section */}
      <div className="flex gap-4 justify-between items-end mb-6">
        <div className="w-[45%] flex flex-col gap-2">
           <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-1">
             <span>Valor Original {isRC ? 'Factura' : 'Remisión'}</span>
             <span className="text-zinc-600">${Number(payload?.total_amount).toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-zinc-100 pb-1">
             <span>Saldo Pendiente Actual</span>
             <span className="font-black italic">${Math.max(0, newBalance).toLocaleString()}</span>
           </div>
        </div>
        <div className="w-[50%] flex justify-between items-center bg-zinc-900 text-white p-4 rounded-[2rem] shadow-xl shadow-zinc-200">
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{amountLabel}</span>
           <span className="text-2xl font-black italic tracking-tighter">${Number(payload?.amount).toLocaleString()}</span>
        </div>
      </div>

      {/* Footer / Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-zinc-100 mt-auto">
        <div className="flex flex-col justify-end items-center opacity-50 px-4">
          <div className="w-full border-t-2 border-zinc-400 pt-2 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
              Entregado por
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-end items-center opacity-50 px-4">
          <div className="w-full border-t-2 border-zinc-400 pt-2 text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
              Recibido Conforme
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.4em]">Generado por MekaWorkshop Enterprise v19.4</p>
      </div>
    </div>
  );
}
