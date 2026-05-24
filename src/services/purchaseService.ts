import { supabase } from '../supabase';
import { Supplier, InvoiceItem, Shipping } from '../types';
import { accountsService } from './accountsService';

/** Mapea una fila raw de Supabase al tipo Supplier tipado */
const mapSupplier = (d: any): Supplier => ({
  id: d.id,
  tenantId: d.tenant_id,
  name: d.name,
  phone: d.phone,
  email: d.email,
  address: d.address,
  idType: d.id_type,
  idNumber: d.id_number,
  discount: Number(d.discount || 0),
  retefuente: Number(d.retefuente || 0),
  reteica: Number(d.reteica || 0)
});

export const purchaseService = {
  async searchSupplier(tenantId: string, idNumber: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('meka_suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id_number', idNumber)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapSupplier(data);
  },

  async createSupplier(tenantId: string, supplierData: any): Promise<Supplier> {
    const { data, error } = await supabase
      .from('meka_suppliers')
      .insert({
        tenant_id: tenantId,
        name: supplierData.name,
        phone: supplierData.phone,
        email: supplierData.email,
        address: supplierData.address,
        id_type: supplierData.idType,
        id_number: supplierData.idNumber,
        discount: Number(supplierData.discount || 0),
        retefuente: Number(supplierData.retefuente || 0),
        reteica: Number(supplierData.reteica || 0)
      })
      .select()
      .single();

    if (error) throw error;
    return mapSupplier(data);
  },

  async savePurchase(params: {
    tenantId: string;
    supplierId: string;
    invoiceNumber: string;
    date: string;
    items: InvoiceItem[];
    subtotal?: number;
    totalDiscount?: number;
    taxableBase?: number;
    ivaTotal?: number;
    total: number;
    paymentMethod: string;
  }): Promise<void> {
    // 1. Guardar la remisión
    const { data: shippingData, error: purchaseError } = await supabase
      .from('meka_shipping')
      .insert({
        tenant_id: params.tenantId,
        supplier_id: params.supplierId,
        invoice_number: params.invoiceNumber,
        date: params.date,
        items: params.items,
        subtotal: params.subtotal || 0,
        total_discount: params.totalDiscount || 0,
        taxable_base: params.taxableBase || 0,
        iva_total: params.ivaTotal || 0,
        total: params.total,
        payment_method: params.paymentMethod
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // 1.5 Integración Cuentas por Pagar (CXP)
    if (params.paymentMethod.startsWith('CREDITO')) {
      const daysStr = params.paymentMethod.split('_')[1] || '30';
      const days = parseInt(daysStr, 10);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      await accountsService.createPayable({
        tenant_id: params.tenantId,
        supplier_id: params.supplierId,
        shipping_id: shippingData.id,
        total_amount: params.total,
        due_date: dueDate.toISOString(),
      });
    }

    // 2. Actualizar stock y registrar flujo
    for (const item of params.items) {
      const cleanSku = item.sku?.trim();
      if (!cleanSku) continue;

      // Buscar producto de forma insensible a mayúsculas
      const { data: currentItem } = await supabase
        .from('meka_inventory')
        .select('id, stock')
        .ilike('sku', cleanSku)
        .eq('tenant_id', params.tenantId)
        .maybeSingle();

      if (currentItem) {
        const newStock = Number(currentItem.stock) + item.quantity;
        
        // Actualizar stock y precio de última compra
        await supabase
          .from('meka_inventory')
          .update({ 
            stock: newStock,
            price: item.price // Actualizamos el precio del inventario con el de la última compra
          })
          .eq('id', currentItem.id);

        // Log de flujo
        await supabase.from('meka_inventory_flow').insert({
          tenant_id: params.tenantId,
          sku: cleanSku,
          date: new Date().toISOString(),
          cantidad: item.quantity,
          tipo: 'COMPRA',
          descripcion: `Compra #${params.invoiceNumber}`
        });
      }
    }
  },

  async getNextShippingNumber(tenantId: string): Promise<string> {
    const { data, error } = await supabase
      .from('meka_shipping')
      .select('invoice_number')
      .eq('tenant_id', tenantId)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting next shipping number:', error);
      return '000001';
    }
    
    if (data) {
      const lastNum = parseInt(data.invoice_number) || 0;
      return (lastNum + 1).toString().padStart(6, '0');
    }
    return '000001';
  },

  async getShippingByRange(tenantId: string, dateFrom: string, dateTo: string): Promise<any[]> {
    const start = `${dateFrom}T00:00:00.000-05:00`;
    const end = `${dateTo}T23:59:59.999-05:00`;

    const { data, error } = await supabase
      .from('meka_shipping')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllSuppliers(tenantId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('meka_suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapSupplier);
  }
};
