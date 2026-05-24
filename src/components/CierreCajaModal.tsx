import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { BaseMontos } from './AperturaCajaModal';

interface CierreCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reales: BaseMontos, observaciones: string) => void;
  bases: BaseMontos;
  ventas: BaseMontos;
  fechaApertura?: string;
  isSaving?: boolean;
}

export default function CierreCajaModal({
  isOpen,
  onClose,
  onConfirm,
  bases,
  ventas,
  fechaApertura,
  isSaving
}: CierreCajaProps) {
  const [reales, setReales] = useState({
    efectivo: '',
    tarjetaDebito: '',
    tarjetaCredito: '',
    nequi: '',
    daviplata: ''
  });
  const [observaciones, setObservaciones] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    } else {
      // RESET automático al cerrar el modal
      setReales({
        efectivo: '',
        tarjetaDebito: '',
        tarjetaCredito: '',
        nequi: '',
        daviplata: ''
      });
      setObservaciones('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const expected = {
    efectivo: bases.efectivo + ventas.efectivo,
    tarjetaDebito: bases.tarjetaDebito + ventas.tarjetaDebito,
    tarjetaCredito: bases.tarjetaCredito + ventas.tarjetaCredito,
    nequi: bases.nequi + ventas.nequi,
    daviplata: bases.daviplata + ventas.daviplata
  };

  const totalEsperado = expected.efectivo + expected.tarjetaDebito + expected.tarjetaCredito + expected.nequi + expected.daviplata;
  const isOverdue = fechaApertura ? differenceInHours(currentTime, new Date(fechaApertura)) >= 24 : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      efectivo: Number(reales.efectivo) || 0,
      tarjetaDebito: Number(reales.tarjetaDebito) || 0,
      tarjetaCredito: Number(reales.tarjetaCredito) || 0,
      nequi: Number(reales.nequi) || 0,
      daviplata: Number(reales.daviplata) || 0
    }, observaciones);
  };

  const handleChange = (field: keyof typeof reales, value: string) => {
    setReales(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden card-shadow relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-[#0a1e3f] text-xl font-black tracking-widest uppercase">Arqueo de Caja</h2>
            <div className="flex items-center gap-6 mt-1">
              {fechaApertura && (
                <p className={`text-[13px] font-black tracking-widest uppercase flex items-center gap-1.5 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-[#0fa968]'}`}>
                  <span className="opacity-50">DESDE:</span> {format(new Date(fechaApertura), 'iii dd MMM, hh:mm a')}
                </p>
              )}
              <p className={`text-[13px] font-black tracking-widest uppercase flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-[#8b9eae]'}`}>
                <span className="opacity-50">HASTA:</span> {format(currentTime, 'iii dd MMM, hh:mm a')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-[#f4f7fb] hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar">
          
          <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-3xl p-3 text-center mb-4 flex items-center justify-center gap-10 card-shadow scale-[0.98]">
            <div className="text-left">
              <p className="text-[#fb7185] text-[9px] font-black tracking-widest uppercase mb-0.5">Total Esperado (SISTEMA)</p>
              <p className="text-[#e11d48] text-[7px] font-bold tracking-widest uppercase opacity-70">
                INCLUYE BASES + VENTAS + ABONOS - COMPRAS
              </p>
            </div>
            <p className="text-[#e11d48] text-3xl font-black tracking-tighter">${totalEsperado.toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-[#0a1e3f] text-[9px] font-black tracking-widest uppercase mb-3 text-center border-b pb-2 opacity-60">DESGLOSE POR MEDIO DE PAGO</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Columna Izquierda: Efectivo, Nequi, Daviplata */}
              <div className="flex flex-col gap-3">
                <PaymentItem ref={firstInputRef} label="Efectivo" field="efectivo" expectedValue={expected.efectivo} colorClass="text-emerald-500" value={reales.efectivo} onChange={handleChange} />
                <PaymentItem label="Nequi" field="nequi" expectedValue={expected.nequi} colorClass="text-purple-500" value={reales.nequi} onChange={handleChange} />
                <PaymentItem label="Daviplata" field="daviplata" expectedValue={expected.daviplata} colorClass="text-purple-500" value={reales.daviplata} onChange={handleChange} />
              </div>
              {/* Columna Derecha: Tarjetas */}
              <div className="flex flex-col gap-3">
                <PaymentItem label="Tarjeta Débito" field="tarjetaDebito" expectedValue={expected.tarjetaDebito} colorClass="text-blue-500" value={reales.tarjetaDebito} onChange={handleChange} />
                <PaymentItem label="Tarjeta Crédito" field="tarjetaCredito" expectedValue={expected.tarjetaCredito} colorClass="text-blue-500" value={reales.tarjetaCredito} onChange={handleChange} />
              </div>
            </div>
          </div>
          
          <div>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full text-[#8b9eae] text-[11px] font-bold bg-[#f8fafc] border border-[#e1e8f0] rounded-2xl px-5 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all min-h-[60px] resize-none"
              placeholder="OBSERVACIONES / NOVEDADES DEL TURNO..."
            ></textarea>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ backgroundColor: 'var(--emphasis-color)' }}
            className={`w-full text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-2xl py-4 transition-all shadow-xl disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3 ${isOverdue ? 'animate-pulse-red ring-2 ring-red-400' : ''}`}
          >
            {isOverdue && <span className="text-lg">⚠️</span>}
            {isSaving ? 'GUARDANDO ARQUEO...' : 'CERRAR CAJA Y GUARDAR ARQUEO'}
          </button>
        </div>

      </div>
    </div>
  );
}

const PaymentItem = React.forwardRef<HTMLInputElement, { 
  label: string, 
  field: string, 
  expectedValue: number, 
  colorClass: string,
  value: string,
  onChange: (field: any, val: string) => void
}>(({ 
  label, 
  field, 
  expectedValue, 
  colorClass, 
  value, 
  onChange 
}, ref) => (
  <div className="flex items-center justify-between gap-3 p-2.5 bg-[#f8fafc] rounded-2xl border border-[#e1e8f0] hover:border-zinc-300 transition-all">
    <div className="flex flex-col min-w-0">
      <span className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${colorClass}`}>{label}</span>
      <div className="flex items-baseline gap-1 text-[#0a1e3f]">
        <span className="text-[8px] font-bold opacity-60">SISTEMA:</span>
        <span className="text-xs font-black tracking-tight">${expectedValue.toLocaleString()}</span>
      </div>
    </div>
    <div className="flex flex-col items-end pt-2">
      <input
        ref={ref}
        type="number"
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-24 text-right text-sm font-black bg-white border border-[#e1e8f0] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-zinc-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0"
      />
    </div>
  </div>
));
