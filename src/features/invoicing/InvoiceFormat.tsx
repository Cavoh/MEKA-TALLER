import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tenant, Client, InvoiceItem } from '../../types';

interface InvoiceFormatProps {
  tenant: Tenant;
  client: Client | { name: string; idType: string; idNumber: string; phone: string; email: string; address: string; discount: number; };
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableBase: number;
  ivaTotal: number;
  total: number;
  paymentMethod: string;
  mechanic?: string;
  isPurchase?: boolean;
}

export const InvoiceFormat: React.FC<InvoiceFormatProps> = ({
  tenant,
  client,
  invoiceNumber,
  items,
  subtotal,
  totalDiscount,
  ivaTotal,
  total,
  paymentMethod,
  mechanic,
  isPurchase
}) => {
  return (
    <div className="print-visible bg-white p-8 text-zinc-900 font-sans max-w-[21cm] mx-auto border-2 border-zinc-100 shadow-sm rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-10">
        <div className="flex gap-6 items-center">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt="Logo" className="w-28 h-28 object-contain rounded-2xl border border-zinc-100 p-2 shadow-sm" />
          ) : (
            <div className="w-28 h-28 bg-zinc-900 flex items-center justify-center rounded-2xl text-white font-black text-3xl italic shadow-xl">
              MEKA
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 italic">
              {tenant?.custom_name || tenant?.name}
            </h1>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
              <p className="font-black text-zinc-900">{tenant?.address}</p>
              <p>NIT: {tenant?.nit || '800-234-900-1'}</p>
              <p>CEL: {tenant?.phone}</p>
              <p className="lowercase italic">{tenant?.email}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-zinc-900 text-white px-8 py-5 rounded-[2.5rem] inline-block mb-3 shadow-2xl shadow-zinc-200">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">{isPurchase ? 'Compra de Insumos' : 'Factura de Venta'}</p>
            <p className="text-3xl font-black tracking-tighter italic">#{invoiceNumber}</p>
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic pr-4">
            {isPurchase ? 'Recepción de Mercancía' : 'Documento de Garantía'}
          </p>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="bg-zinc-50/80 p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-3">
            {isPurchase ? 'Información Proveedor' : 'Titular de Cuenta'}
          </h3>
          <p className="text-xl font-black text-zinc-900 uppercase leading-none mb-3 italic tracking-tight">{client?.name || 'Venta General'}</p>
          <div className="text-[11px] font-bold text-zinc-600 space-y-2 translate-y-1">
            <p className="flex justify-between border-b border-zinc-200/50 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">ID Tributaria:</span>
              <span className="font-black">{client?.idType} {client?.idNumber}</span>
            </p>
            <p className="flex justify-between border-b border-zinc-200/50 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Contacto:</span>
              <span className="font-black">{client?.phone}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Localidad:</span>
              <span className="font-black truncate max-w-[150px]">{client?.address}</span>
            </p>
          </div>
        </div>
        <div className="bg-zinc-50/80 p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-3">Detalle Transaccional</h3>
          <div className="text-[11px] font-bold text-zinc-600 space-y-2 translate-y-1">
            <p className="flex justify-between border-b border-zinc-200/50 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Emisión:</span>
              <span className="font-black">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}</span>
            </p>
            <p className="flex justify-between border-b border-zinc-200/50 pb-1">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Condición:</span>
              <span className="bg-zinc-900 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase">{paymentMethod}</span>
            </p>
            <p className="flex justify-between text-zinc-900">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Responsable:</span>
              <span className="font-black italic tracking-tight">{mechanic || 'Sistema Meka'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-center w-16">Cant.</th>
            <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-left px-6">Descripción del Servicio / Producto</th>
            <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-right w-28">P. Unitario</th>
            <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-right w-24">Desc.</th>
            <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] text-right w-32 border-l-2 border-zinc-50 pl-4">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/50">
          {items.map((item, idx) => (
            <tr key={idx} className="group">
              <td className="py-5 text-sm font-black text-center text-zinc-900 bg-zinc-50/30 group-odd:bg-transparent">{item.quantity}</td>
              <td className="py-5 px-6">
                <p className="text-xs font-black text-zinc-900 uppercase tracking-tight italic">{item.description}</p>
                {item.sku && <p className="text-[9px] font-bold text-zinc-400 mt-1 flex items-center gap-1"><span className="opacity-50 tracking-widest">REF:</span> {item.sku}</p>}
              </td>
              <td className="py-5 text-xs font-bold text-right text-zinc-600 tracking-tight">${item.price.toLocaleString()}</td>
              <td className="py-5 text-xs font-black text-right text-emerald-600 tracking-tighter">-{item.discount}%</td>
              <td className="py-5 text-sm font-black text-right text-zinc-900 border-l-2 border-zinc-50 pl-4 italic">${item.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-16">
        <div className="w-64 space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            <span>Subtotal Bruto</span>
            <span className="text-zinc-700 font-bold">${subtotal.toLocaleString()}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-zinc-100 pb-2 bg-red-50/30 px-2 rounded-lg">
              <span>Descuento Aplicado</span>
              <span className="font-black">-${totalDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            <span>IVA Causado</span>
            <span className="text-zinc-900 font-black italic">${ivaTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-900 text-white p-7 rounded-[3rem] shadow-2xl shadow-zinc-300 transform scale-105 origin-right">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Total Neto</span>
            <span className="text-[32px] font-black italic tracking-tighter">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="grid grid-cols-2 gap-16 pt-10 border-t-2 border-zinc-900">
        <div className="space-y-6">
          <div>
            <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] mb-3 border-l-4 border-zinc-900 pl-3 italic">
              Cláusulas y Garantías
            </h4>
            <p className="text-[9px] text-zinc-500 font-bold leading-relaxed pr-8 text-justify">
              {isPurchase 
                ? 'Documento soporte de adquisición electrónica. La recepción de los insumos detallados arriba se realiza conforme a las políticas de calidad del taller y acuerdos previos con el proveedor.' 
                : 'La garantía de los servicios prestados es de 30 días o 1.000 KM (lo que ocurra primero). Repuestos eléctricos no cuentan con garantía. Este documento presta mérito ejecutivo en caso de mora en pagos a crédito.'
              }
            </p>
          </div>
          <p className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.6em]">MekaWorkshop Solution Verified</p>
        </div>
        <div className="flex flex-col justify-end items-end gap-12">
          <div className="w-56 border-t font-black border-zinc-300 mt-16 text-center pt-3 italic">
            <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Firma Autorizada</p>
            <p className="text-[9px] text-zinc-900 uppercase tracking-tighter">{isPurchase ? 'Recepción Taller' : 'Titular de Cuenta'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
