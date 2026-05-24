import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tenant, Client, MaintenanceItem } from '../../types';
import { Gauge, ShieldCheck } from 'lucide-react';

interface ServiceOrderFormatProps {
  tenant: Tenant;
  client: Client | { name: string; idType: string; idNumber: string; phone: string; email: string; address: string; };
  plate: string;
  km: number;
  mechanic: string;
  orderNumber: string;
  items: MaintenanceItem[];
  date: string;
  notes?: string;
}

export const ServiceOrderFormat: React.FC<ServiceOrderFormatProps> = ({
  tenant,
  client,
  plate,
  km,
  mechanic,
  orderNumber,
  items,
  date,
  notes
}) => {
  const total = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const filteredItems = items.filter(item => item.description?.trim());

  return (
    <div className="print-visible bg-white text-zinc-900 font-sans max-w-[21cm] mx-auto" style={{ padding: '16px 20px', fontSize: '11px' }}>

      {/* ── HEADER compact ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #18181b', paddingBottom: '8px', marginBottom: '10px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #f4f4f5', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '44px', height: '44px', background: '#18181b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '12px', fontStyle: 'italic', flexShrink: 0 }}>
              MEKA
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.04em', fontStyle: 'italic', lineHeight: 1 }}>
              {tenant?.custom_name || tenant?.name}
            </div>
            <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: '#18181b' }}>{tenant?.address}</span>
              <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>
              NIT: {tenant?.nit || '800-234-900-1'}
              <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>
              CEL: {tenant?.phone}
              <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>
              <span style={{ fontStyle: 'italic' }}>{tenant?.email}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ background: '#18181b', color: 'white', padding: '4px 12px', borderRadius: '10px', display: 'inline-block' }}>
            <div style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: '1px' }}>Orden de Servicio</div>
            <div style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.04em', fontFamily: 'monospace' }}>#{orderNumber}</div>
          </div>
          <div style={{ fontSize: '8px', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', marginTop: '3px' }}>
            <ShieldCheck style={{ width: '10px', height: '10px' }} /> Certificado de Calidad
          </div>
        </div>
      </div>

      {/* ── INFO BAND: client + vehicle + service in one compact row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0', border: '1.5px solid #e4e4e7', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' }}>
        {/* Client */}
        <div style={{ padding: '8px 12px', borderRight: '1.5px solid #e4e4e7' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.15em', borderLeft: '3px solid #18181b', paddingLeft: '6px', marginBottom: '4px' }}>Responsable</div>
          <div style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '4px' }}>{client?.name || 'Cliente Particular'}</div>
          <div style={{ fontSize: '9px', color: '#52525b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div><span style={{ color: '#a1a1aa' }}>ID: </span><strong>{client?.idNumber}</strong></div>
            <div><span style={{ color: '#a1a1aa' }}>TEL: </span><strong>{client?.phone}</strong></div>
            <div><span style={{ color: '#a1a1aa' }}>EMAIL: </span><strong style={{ fontStyle: 'italic' }}>{client?.email}</strong></div>
            <div><span style={{ color: '#a1a1aa' }}>DIR: </span><span>{client?.address}</span></div>
          </div>
        </div>

        {/* Vehicle — dark center pill */}
        <div style={{ padding: '8px 16px', background: '#18181b', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Vehículo</div>
          <div style={{ fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.04em', lineHeight: 1 }}>{plate}</div>
          <div style={{ fontSize: '8px', fontWeight: 700, color: '#52525b', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', textTransform: 'uppercase' }}>Placa</div>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Gauge style={{ width: '12px', height: '12px', color: '#34d399' }} />
            <span style={{ fontSize: '11px', fontWeight: 900, fontStyle: 'italic' }}>{km.toLocaleString()} <span style={{ fontSize: '8px' }}>KM</span></span>
          </div>
        </div>

        {/* Service Meta */}
        <div style={{ padding: '8px 12px', borderLeft: '1.5px solid #e4e4e7' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.15em', borderLeft: '3px solid #18181b', paddingLeft: '6px', marginBottom: '4px' }}>Datos del Servicio</div>
          <div style={{ fontSize: '9px', color: '#52525b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f5', paddingBottom: '2px' }}>
              <span style={{ color: '#a1a1aa' }}>Fecha:</span>
              <strong style={{ textTransform: 'uppercase' }}>{format(new Date(date), 'dd/MM/yyyy', { locale: es })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f5', paddingBottom: '2px' }}>
              <span style={{ color: '#a1a1aa' }}>Mecánico:</span>
              <strong style={{ fontStyle: 'italic' }}>{mechanic}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#a1a1aa' }}>Estado:</span>
              <span style={{ background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: '20px', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase' }}>Abierto</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE compact ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ borderBottom: '2.5px solid #18181b' }}>
            <th style={{ padding: '4px 6px', fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', width: '36px' }}>#</th>
            <th style={{ padding: '4px 8px', fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'left' }}>Descripción del Requerimiento / Trabajo</th>
            <th style={{ padding: '4px 8px', fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', width: '60px' }}>Cant.</th>
            <th style={{ padding: '4px 8px', fontSize: '8px', fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', width: '90px', borderLeft: '2px solid #f4f4f5' }}>Valor Ref.</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f4f4f5', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
              <td style={{ padding: '3px 6px', fontSize: '9px', fontWeight: 900, color: '#d4d4d8', textAlign: 'center', fontFamily: 'monospace' }}>{(idx + 1).toString().padStart(2, '0')}</td>
              <td style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', fontStyle: 'italic' }}>{item.description}</td>
              <td style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 900, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 900, textAlign: 'right', fontStyle: 'italic', borderLeft: '2px solid #f4f4f5' }}>${(item.total || 0).toLocaleString()}</td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#d4d4d8', fontStyle: 'italic', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>
                No se han registrado repuestos o servicios aún
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── TOTAL + NOTES compact row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start', marginBottom: '6px', borderTop: '1.5px solid #e4e4e7', paddingTop: '8px' }}>
        <div style={{ padding: '8px 12px', border: '1.5px dashed #e4e4e7', borderRadius: '8px' }}>
          <div style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#71717a', marginBottom: '4px' }}>Observaciones</div>
          <p style={{ fontSize: '9px', color: '#52525b', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
            {notes || 'Sin observaciones adicionales registradas para este servicio técnico.'}
          </p>
        </div>
        <div style={{ background: '#18181b', color: 'white', padding: '8px 20px', borderRadius: '12px', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '2px' }}>Total Estimado</div>
          <div style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.04em' }}>${total.toLocaleString()}</div>
          <div style={{ fontSize: '7px', fontWeight: 700, opacity: 0.4, fontStyle: 'italic', marginTop: '2px' }}>* Sujeto a variación</div>
        </div>
      </div>
    </div>
  );
};
