import { supabase } from '../supabase';
import { Receivable, Payable, ReceivablePayment, PayablePayment } from '../types';

export const accountsService = {
  // ==========================================
  // CUENTAS POR COBRAR (CXC) - CLIENTES
  // ==========================================

  createReceivable: async (data: Omit<Receivable, 'id' | 'created_at' | 'status' | 'paid_amount'>) => {
    const { data: result, error } = await supabase
      .from('meka_receivables')
      .insert({
        ...data,
        status: 'PENDING',
        paid_amount: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return result as Receivable;
  },

  getReceivables: async (tenantId: string, clientId?: string) => {
    let query = supabase
      .from('meka_receivables')
      .select(`
        *,
        client:meka_clients(*),
        invoice:meka_invoices(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getNextReceivableReceiptNumber: async (tenantId: string) => {
    const { count, error } = await supabase
      .from('meka_receivable_payments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    
    if (error) return 'RC-000001';
    return `RC-${((count || 0) + 1).toString().padStart(6, '0')}`;
  },

  addReceivablePayment: async (data: Omit<ReceivablePayment, 'id' | 'payment_date'>) => {
    // 1. Insertar el abono
    const { data: payment, error: pError } = await supabase
      .from('meka_receivable_payments')
      .insert(data)
      .select()
      .single();
    
    if (pError) throw pError;

    // 2. Traer la cuenta actual para recalcular estado
    const { data: receivable, error: rError } = await supabase
      .from('meka_receivables')
      .select('*')
      .eq('id', data.receivable_id)
      .single();
    
    if (rError) throw rError;

    const newPaidAmount = Number(receivable.paid_amount) + Number(data.amount);
    const newStatus = newPaidAmount >= Number(receivable.total_amount) ? 'PAID' : 'PARTIAL';

    // 3. Actualizar la cuenta maestro
    const { error: updError } = await supabase
      .from('meka_receivables')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus
      })
      .eq('id', data.receivable_id);
    
    if (updError) throw updError;

    return payment;
  },

  getReceivablePayments: async (receivableId: string) => {
    const { data, error } = await supabase
      .from('meka_receivable_payments')
      .select('*')
      .eq('receivable_id', receivableId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // ==========================================
  // CUENTAS POR PAGAR (CXP) - PROVEEDORES
  // ==========================================

  createPayable: async (data: Omit<Payable, 'id' | 'created_at' | 'status' | 'paid_amount'>) => {
    const { data: result, error } = await supabase
      .from('meka_payables')
      .insert({
        ...data,
        status: 'PENDING',
        paid_amount: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return result as Payable;
  },

  getPayables: async (tenantId: string, supplierId?: string) => {
    let query = supabase
      .from('meka_payables')
      .select(`
        *,
        supplier:meka_suppliers(*),
        shipping:meka_shipping(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getNextPayableReceiptNumber: async (tenantId: string) => {
    const { count, error } = await supabase
      .from('meka_payable_payments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    
    if (error) return 'CE-000001';
    return `CE-${((count || 0) + 1).toString().padStart(6, '0')}`;
  },

  addPayablePayment: async (data: Omit<PayablePayment, 'id' | 'payment_date'>) => {
    // 1. Insertar el abono a proveedor
    const { data: payment, error: pError } = await supabase
      .from('meka_payable_payments')
      .insert(data)
      .select()
      .single();
    
    if (pError) throw pError;

    // 2. Traer la cuenta actual
    const { data: payable, error: rError } = await supabase
      .from('meka_payables')
      .select('*')
      .eq('id', data.payable_id)
      .single();
    
    if (rError) throw rError;

    const newPaidAmount = Number(payable.paid_amount) + Number(data.amount);
    const newStatus = newPaidAmount >= Number(payable.total_amount) ? 'PAID' : 'PARTIAL';

    // 3. Actualizar la deuda maestro
    const { error: updError } = await supabase
      .from('meka_payables')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus
      })
      .eq('id', data.payable_id);
    
    if (updError) throw updError;

    return payment;
  },

  getPayablePayments: async (payableId: string) => {
    const { data, error } = await supabase
      .from('meka_payable_payments')
      .select('*')
      .eq('payable_id', payableId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
