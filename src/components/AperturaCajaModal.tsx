import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from './ToastProvider';

export interface BaseMontos {
  efectivo: number;
  tarjetaDebito: number;
  tarjetaCredito: number;
  nequi: number;
  daviplata: number;
  credito?: number;
  abonos_cxc?: number;
  abonos_cxp?: number;
}

interface AperturaCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bases: BaseMontos) => void;
  isSaving?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, { 
  label: string; 
  field: string; 
  value: string; 
  onChange: (field: any, val: string) => void;
}>(({ 
  label, 
  field, 
  value, 
  onChange 
}, ref) => (
  <div className="space-y-2">
    <label className="block text-[#8b9eae] text-[10px] font-black tracking-widest uppercase mb-1">
      {label}
    </label>
    <input
      ref={ref}
      type="number"
      value={value}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full text-[#8b9eae] text-xl font-black bg-white border border-[#e1e8f0] rounded-xl px-4 py-3 outline-none focus:border-[#0fa968] focus:ring-1 focus:ring-[#0fa968]/50 transition-all"
      placeholder="0"
      step="any"
      min="0"
    />
  </div>
));

export default function AperturaCajaModal({ isOpen, onClose, onConfirm, isSaving }: AperturaCajaModalProps) {
  const { showInfo } = useToast();
  const [bases, setBases] = useState({
    efectivo: '',
    tarjetaDebito: '',
    tarjetaCredito: '',
    nequi: '',
    daviplata: ''
  });
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset al cerrar el modal
  React.useEffect(() => {
    if (!isOpen) {
      setBases({
        efectivo: '',
        tarjetaDebito: '',
        tarjetaCredito: '',
        nequi: '',
        daviplata: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setBases(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldMapping = [
      { id: 'efectivo', label: 'EFECTIVO' },
      { id: 'tarjetaDebito', label: 'TARJETA DÉBITO' },
      { id: 'tarjetaCredito', label: 'TARJETA CRÉDITO' },
      { id: 'nequi', label: 'NEQUI' },
      { id: 'daviplata', label: 'DAVIPLATA' }
    ];

    const filledFields = fieldMapping
      .filter(f => Number(bases[f.id as keyof typeof bases]) > 0)
      .map(f => f.label);

    const hasEmptyFields = fieldMapping.some(f => !bases[f.id as keyof typeof bases] || Number(bases[f.id as keyof typeof bases]) === 0);

    if (filledFields.length === 0) {
      showInfo('Ingrese Montos', 'Por favor, ingrese al menos una base para realizar la apertura.');
      return;
    }

    if (hasEmptyFields) {
      let msg = '';
      if (filledFields.length === 1) {
        msg = `¿Únicamente recibiste base de ${filledFields[0]}?`;
      } else {
        const last = filledFields.pop();
        msg = `¿Únicamente recibiste base de ${filledFields.join(', ')} y ${last}?`;
      }

      if (!window.confirm(msg)) {
        return; // Usuario canceló, vuelve al formulario
      }
    }

    onConfirm({
      efectivo: Number(bases.efectivo) || 0,
      tarjetaDebito: Number(bases.tarjetaDebito) || 0,
      tarjetaCredito: Number(bases.tarjetaCredito) || 0,
      nequi: Number(bases.nequi) || 0,
      daviplata: Number(bases.daviplata) || 0
    });
  };

  // InputField was moved outside to solve focus loss issues

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden card-shadow relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[#0a1e3f] text-lg font-black tracking-widest uppercase">Apertura de Caja</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="apertura-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <InputField ref={firstInputRef} label="Base Efectivo" field="efectivo" value={bases.efectivo} onChange={handleChange} />
            <InputField label="Base Tarjeta Débito" field="tarjetaDebito" value={bases.tarjetaDebito} onChange={handleChange} />
            <InputField label="Base Tarjeta Crédito" field="tarjetaCredito" value={bases.tarjetaCredito} onChange={handleChange} />
            <InputField label="Base Nequi" field="nequi" value={bases.nequi} onChange={handleChange} />
            <InputField label="Base Daviplata" field="daviplata" value={bases.daviplata} onChange={handleChange} />
          </form>
        </div>

        <div className="p-8 border-t border-gray-100 flex-shrink-0">
          <button
            type="submit"
            form="apertura-form"
            disabled={isSaving}
            className="w-full bg-[#0fa968] hover:bg-[#0d945a] text-white text-xs font-black tracking-widest uppercase rounded-2xl py-4 transition-colors shadow-lg shadow-[#0fa968]/20 disabled:opacity-50"
          >
            {isSaving ? 'Abriendo Caja...' : 'Confirmar Apertura'}
          </button>
        </div>
      </div>
    </div>
  );
}
