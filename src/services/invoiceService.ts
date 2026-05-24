import { supabase } from '../supabase';
import { Client, InventoryItem, InvoiceItem, Tenant } from '../types';
import { accountsService } from './accountsService';

export const invoiceService = {
  /**
   * Obtiene el siguiente número de factura formateado según el prefijo del taller
   */
  generateInvoiceNumber(tenant: Tenant): string {
    const prefix = tenant.invoice_prefix || '';
    const nextNum = tenant.invoice_next_number || 1;
    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  },

  /**
   * Busca un cliente por su número de identificación (NIT/CC)
   */
  async searchClientById(tenantId: string, idNumber: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('meka_clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id_number', idNumber)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      idType: data.id_type,
      idNumber: data.id_number,
      discount: Number(data.discount || 0)
    };
  },

  /**
   * Obtiene los módulos de mantenimiento abiertos para un cliente específico
   */
  async getOpenMaintenanceModules(tenantId: string, clientId: string) {
    const { data, error } = await supabase
      .from('meka_maintenance')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .eq('status', 'open');

    if (error) throw error;
    return data || [];
  },

  /**
   * Carga los ítems de un módulo de mantenimiento específico
   */
  async getMaintenanceModuleDetails(tenantId: string, moduleId: string) {
    const { data, error } = await supabase
      .from('meka_maintenance')
      .select('id, history, vehicle_plate, mecanico')
      .eq('tenant_id', tenantId)
      .eq('id', moduleId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Procesa la carga de ítems desde el historial de mantenimiento
   */
  processMaintenanceItems(history: any[], inventory: InventoryItem[], clientDiscount: number = 0): InvoiceItem[] {
    const loadedItems: InvoiceItem[] = [];
    
    history.forEach((module: any) => {
      if (module.items && Array.isArray(module.items)) {
        module.items.forEach((item: any) => {
          const price = Number(item.price || item.unitPrice || 0);
          const quantity = Number(item.quantity || 1);
          const total = quantity * price * (1 - clientDiscount / 100);
          
          const itemName = (item.name || item.description || '').trim().toLowerCase();
          const invMatch = inventory.find(i => i.name.trim().toLowerCase() === itemName);
          
          loadedItems.push({
            sku: invMatch?.sku,
            description: item.name || item.description || '',
            quantity,
            price,
            discount: clientDiscount,
            iva: item.iva || 19, 
            total
          });
        });
      }
      
      if (module.laborDescription && module.laborCost) {
        loadedItems.push({
          description: `Mano de obra: ${module.laborDescription}`,
          quantity: 1,
          price: Number(module.laborCost),
          discount: 0,
          iva: 0,
          total: Number(module.laborCost)
        });
      }
    });

    return loadedItems;
  },

  /**
   * Guarda una factura y realiza todas las operaciones relacionadas (stock, estados, numeración)
   */
  async saveInvoiceAndProcess(params: {
    tenant: Tenant;
    clientId: string;
    clientInfo: any;
    invoiceNumber: string;
    items: InvoiceItem[];
    totals: {
      subtotal: number;
      discount: number;
      iva: number;
      total: number;
    };
    paymentType: string;
    mechanic?: string;
    maintenanceId?: string;
  }) {
    const { tenant, clientId, clientInfo, invoiceNumber, items, totals, paymentType, mechanic, maintenanceId } = params;

    // 0. Si el cliente es nuevo, crearlo en meka_clients
    let finalClientId = clientId;
    if (!clientId && clientInfo?.idNumber) {
      const { data: newC, error: cErr } = await supabase
        .from('meka_clients')
        .insert({
          tenant_id: tenant.id,
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email,
          address: clientInfo.address,
          id_type: clientInfo.idType || clientInfo.id_type,
          id_number: clientInfo.idNumber || clientInfo.id_number,
          discount: Number(clientInfo.discount || 0)
        })
        .select('id')
        .single();
      
      if (!cErr && newC) finalClientId = newC.id;
    }

    // 1. Insertar Factura
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('meka_invoices')
      .insert({
        tenant_id: tenant.id,
        client_id: finalClientId,
        invoice_number: invoiceNumber,
        date: new Date().toISOString(),
        subtotal: totals.subtotal,
        total_discount: totals.discount,
        taxable_base: totals.subtotal - totals.discount,
        iva_total: totals.iva,
        total: totals.total,
        payment_type: paymentType,
        mecanico: mechanic || null,
        maintenance_id: maintenanceId || null,
        items: items,
        client_name: clientInfo?.name,
        client_phone: clientInfo?.phone,
        client_email: clientInfo?.email,
        client_address: clientInfo?.address,
        client_id_type: clientInfo?.idType || clientInfo?.id_type,
        client_id_number: clientInfo?.idNumber || clientInfo?.id_number,
        client_discount: clientInfo?.discount
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 2. Procesar Inventario (Stock y Movimientos) mediante RPC atómica
    const { error: stockRpcError } = await supabase.rpc('meka_process_invoice_stock', {
      p_tenant_id: tenant.id,
      p_items: items.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        description: item.description
      })),
      p_invoice_number: invoiceNumber,
      p_maintenance_id: maintenanceId || null
    });

    if (stockRpcError) throw stockRpcError;

    // 3. Cerrar Mantenimiento si aplica
    if (maintenanceId) {
      const { data: mRecord } = await supabase
        .from('meka_maintenance')
        .select('history')
        .eq('id', maintenanceId)
        .eq('tenant_id', tenant.id)
        .single();

      if (mRecord) {
        const history = typeof mRecord.history === 'string'
          ? JSON.parse(mRecord.history)
          : (mRecord.history || []);

        const updatedHistory = history.map((mod: any) =>
          mod.status !== 'closed' ? { ...mod, status: 'closed' } : mod
        );

        await supabase
          .from('meka_maintenance')
          .update({ 
            history: updatedHistory,
            status: 'closed' 
          })
          .eq('id', maintenanceId)
          .eq('tenant_id', tenant.id);
      }
    }

    // 4. Integración Cuentas por Cobrar (CXC)
    if (paymentType.startsWith('CREDITO')) {
      const daysStr = paymentType.split('_')[1] || '30';
      const days = parseInt(daysStr, 10);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      await accountsService.createReceivable({
        tenant_id: tenant.id,
        client_id: finalClientId,
        invoice_id: invoiceData.id,
        total_amount: totals.total,
        due_date: dueDate.toISOString(),
      });
    }

    // 5. Incrementar número de factura de forma ATÓMICA (función SQL)
    const { data: nextInvoiceVal, error: rpcError } = await supabase
      .rpc('increment_invoice_number', { p_tenant_id: tenant.id });

    if (rpcError) throw rpcError;

    return { invoiceData, nextInvoiceVal };
  }
};
