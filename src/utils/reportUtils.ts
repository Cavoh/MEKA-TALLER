import { format } from 'date-fns';

export const translationDict: Record<string, string> = {
  'invoice_number': 'NÚMERO FACTURA',
  'items': 'ÍTEMS / DETALLES',
  'date': 'FECHA',
  'subtotal': 'SUBTOTAL',
  'total_discount': 'DESCUENTO TOTAL',
  'total': 'TOTAL NETO',
  'payment_type': 'FORMA PAGO',
  'payment_method': 'FORMA PAGO',
  'taxable_base': 'BASE GRAVABLE',
  'iva_total': 'TOTAL IVA',
  'client_name': 'CLIENTE',
  'client_phone': 'TELÉFONO',
  'client_email': 'CORREO',
  'client_address': 'DIRECCIÓN',
  'client_discount': 'DESCUENTO CLIENTE',
  'mecanico': 'MECÁNICO',
  'category': 'CATEGORÍA',
  'stock': 'STOCK',
  'price': 'PRECIO',
  'description': 'DESCRIPCIÓN',
  'supplier': 'PROVEEDOR',
  'created_at': 'FECHA REGISTRO',
  'due_date': 'VENCIMIENTO',
  'vehicle_plate': 'PLACA',
  'id': 'ID',
  'tenant_id': 'ID TALLER',
  'status': 'ESTADO',
  'notes': 'NOTAS',
  'mechanic': 'MECÁNICO',
  'total_amount': 'VALOR TOTAL',
  'paid_amount': 'VALOR ABONADO'
};

export const formatReportValue = (key: string, val: any) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map((it: any) => it.description || it.name || it.item_name || JSON.stringify(it)).join(' | ');
    }
    return val.name || val.description || JSON.stringify(val);
  }
  if (['date', 'created_at', 'due_date'].includes(key.toLowerCase()) && typeof val === 'string' && val.includes('-')) {
    try { return format(new Date(val), 'dd/MM/yyyy'); } catch (e) { return val; }
  }
  return val.toString();
};
