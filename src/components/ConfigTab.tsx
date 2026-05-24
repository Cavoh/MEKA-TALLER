import React, { useState, useContext, useEffect } from 'react';
import { WorkshopContext } from '../context/WorkshopContext';
import {
  Settings,
  Layout,
  CheckCircle2,
  Save,
  FileText,
  Type,
  Hash,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import { cn } from '../utils';
import { supabase } from '../supabase';
import { useToast } from './ToastProvider';

export default function ConfigTab() {
  const { tenant } = useContext(WorkshopContext);
  const { showSuccess, showError } = useToast();
  const [fields, setFields] = useState<string[]>([]);
  const [designId, setDesignId] = useState('design1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant?.invoiceConfig) {
      setFields(tenant.invoiceConfig.fields || []);
      setDesignId(tenant.invoiceConfig.designId || 'design1');
    }
  }, [tenant]);

  const availableFields = [
    { id: 'idType', label: 'Tipo de ID', icon: CreditCard },
    { id: 'idNumber', label: 'ID / NIT', icon: Hash },
    { id: 'name', label: 'Nombre Cliente', icon: User },
    { id: 'phone', label: 'Teléfono', icon: Phone },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'address', label: 'Dirección', icon: MapPin },
    { id: 'date', label: 'Fecha y Hora', icon: Calendar },
    { id: 'invoiceNumber', label: 'Número Factura', icon: Hash },
    { id: 'discount', label: 'Descuento', icon: CheckCircle2 },
    { id: 'mechanic', label: 'Mecánico', icon: User },
    { id: 'plate', label: 'Placa Vehículo', icon: Settings },
  ];

  const designs = [
    { id: 'design1', name: 'Clásico Profesional', color: 'bg-zinc-900' },
    { id: 'design2', name: 'Moderno Minimalista', color: 'bg-blue-600' },
    { id: 'design3', name: 'Industrial Taller', color: 'bg-orange-600' },
    { id: 'design4', name: 'Elegante Corporativo', color: 'bg-indigo-900' },
    { id: 'design5', name: 'Compacto Rápido', color: 'bg-emerald-600' },
    { id: 'design6', name: 'Detallado Técnico', color: 'bg-red-700' },
  ];

  const toggleField = (id: string) => {
    setFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meka_tenants')
        .update({
          invoice_config: {
            fields,
            designId
          }
        })
        .eq('id', tenant.id);

      if (error) throw error;
      showSuccess('Configuración Guardada', 'Los ajustes del taller han sido actualizados.');
    } catch (err: any) {
      showError('Error al Guardar', err.message || 'No se pudo guardar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 text-xs"
        >
          {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
          GUARDAR CAMBIOS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fields Selection */}
        <div className="bg-[var(--modal-bg)] py-2 px-8 rounded-3xl border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--table-header-bg)] p-2 rounded-lg">
              <Type className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">Campos del Modelo</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {availableFields.map((field) => (
              <button
                key={field.id}
                onClick={() => toggleField(field.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                  fields.includes(field.id)
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                    : "bg-[var(--modal-bg)] border-[var(--border-main)] text-zinc-600 hover:border-[var(--border-main)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <field.icon className={cn("w-4 h-4", fields.includes(field.id) ? "text-white/60" : "text-[var(--text-muted)]")} />
                  <span className="text-sm font-bold">{field.label}</span>
                </div>
                {fields.includes(field.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Design Selection */}
        <div className="bg-[var(--modal-bg)] py-2 px-8 rounded-3xl border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--table-header-bg)] p-2 rounded-lg">
              <Layout className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">Diseño de Factura</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {designs.map((design) => (
              <button
                key={design.id}
                onClick={() => setDesignId(design.id)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group",
                  designId === design.id
                    ? "border-zinc-900 bg-[var(--table-header-bg)] shadow-lg"
                    : "border-[var(--border-main)] bg-[var(--modal-bg)] hover:border-[var(--border-main)]"
                )}
              >
                <div className={cn("h-2 w-full absolute top-0 left-0", design.color)} />
                <div className="mt-2 space-y-2">
                  <p className={cn("text-xs font-black uppercase tracking-wider", designId === design.id ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>
                    {design.name}
                  </p>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-zinc-200 rounded-full" />
                    <div className="h-1 w-2/3 bg-zinc-200 rounded-full" />
                    <div className="h-1 w-1/2 bg-zinc-200 rounded-full" />
                  </div>
                </div>
                {designId === design.id && (
                  <div className="absolute bottom-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--text-main)]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="pt-4">
            <div className="bg-[var(--table-header-bg)] p-4 rounded-2xl border border-[var(--border-main)] flex items-center gap-4">
              <FileText className="w-8 h-8 text-zinc-300" />
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-relaxed">
                El diseño seleccionado se aplicará automáticamente a todas las facturas generadas y exportadas a PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

