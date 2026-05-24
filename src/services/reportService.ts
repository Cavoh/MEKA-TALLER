import { supabase } from '../supabase';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

export const reportService = {
  async fetchAnalytics(tenantId: string, dateFrom: string, dateTo: string) {
    const fromISO = startOfDay(parseISO(dateFrom)).toISOString();
    const toISO = endOfDay(parseISO(dateTo)).toISOString();

    // 1. Invoices for Sales metrics
    const { data: invoices } = await supabase
      .from('meka_invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', fromISO)
      .lte('date', toISO);

    // 2. Inventory for Critical Stock
    const { data: inventory } = await supabase
      .from('meka_inventory')
      .select('*')
      .eq('tenant_id', tenantId);

    // 3. Maintenance for Service counts
    const { data: maintenance } = await supabase
      .from('meka_maintenance')
      .select('status, created_at, vehicle_plate, meka_clients(name)')
      .eq('tenant_id', tenantId)
      .gte('created_at', fromISO)
      .lte('created_at', toISO);

    return {
      invoices: invoices || [],
      inventory: inventory || [],
      maintenance: maintenance || []
    };
  },

  async fetchUnifiedTransactions(tenantId: string, dateFrom: string, dateTo: string) {
    const startUtc = startOfDay(parseISO(dateFrom)).toISOString();
    const endUtc = endOfDay(parseISO(dateTo)).toISOString();

    const { data: personnelData } = await supabase.from('meka_personal').select('nombre, email');
    const personnelMap = (personnelData || []).reduce((acc: Record<string, string>, curr: { nombre: string; email: string }) => {
      if (curr.email) acc[curr.email.toLowerCase()] = curr.nombre;
      return acc;
    }, {});

    const [
      { data: invoicesData, error: invoicesError },
      { data: shippingsData },
      { data: recData },
      { data: payData },
      { data: tenantData }
    ] = await Promise.all([
      supabase.from('meka_invoices').select('*, meka_clients(name), meka_maintenance(history, mecanico)').eq('tenant_id', tenantId).gte('date', startUtc).lte('date', endUtc).order('date', { ascending: false }),
      supabase.from('meka_shipping').select('*, meka_suppliers(name)').eq('tenant_id', tenantId).gte('date', startUtc).lte('date', endUtc),
      supabase.from('meka_receivable_payments').select('*, receivable:receivable_id(total_amount, paid_amount, client:client_id(name, id_number), invoice:invoice_id(invoice_number))').eq('tenant_id', tenantId).gte('payment_date', startUtc).lte('payment_date', endUtc),
      supabase.from('meka_payable_payments').select('*, payable:payable_id(total_amount, paid_amount, supplier:supplier_id(name, id_number), shipping:shipping_id(invoice_number))').eq('tenant_id', tenantId).gte('payment_date', startUtc).lte('payment_date', endUtc),
      supabase.from('meka_tenants').select('email').eq('id', tenantId).single()
    ]);

    if (invoicesError) throw invoicesError;

    const tenantEmail = tenantData?.email || '';

    const formattedInvoices = (invoicesData || []).map((inv: any) => {
      let mechanicName = inv.mecanico || inv.meka_maintenance?.mecanico || 'S/M';
      if (mechanicName === 'S/M' && inv.meka_maintenance?.history) {
        const history = typeof inv.meka_maintenance.history === 'string' ? JSON.parse(inv.meka_maintenance.history) : inv.meka_maintenance.history;
        if (Array.isArray(history) && history.length > 0) {
          const rawMechanic = history[0].mechanic || 'S/M';
          if (rawMechanic.includes('@')) mechanicName = personnelMap[rawMechanic.toLowerCase()] || rawMechanic.split('@')[0].toUpperCase();
          else mechanicName = rawMechanic;
        }
      }
      let cName = inv.client_name;
      if (!cName || cName.includes('@') || cName === tenantEmail) cName = inv.meka_clients?.name || 'Cliente S/N';
      return { ...inv, clientName: cName, mechanic: mechanicName };
    });

    const tInvoices = formattedInvoices.filter((inv: any) => !(inv.payment_type || '').toUpperCase().startsWith('CREDITO')).map((inv: any) => ({
      id: inv.id, date: inv.date, type: 'INGRESO' as const, sourceType: 'FACTURA' as const, documentNumber: inv.invoice_number, paymentMethod: inv.payment_type || 'EFECTIVO', mechanic: inv.mechanic, entityName: inv.clientName, total: Number(inv.total), discount: Number(inv.total_discount || 0), taxableBase: Number(inv.taxable_base || 0), ivaTotal: Number(inv.iva_total || 0), originalPayload: inv
    }));

    const tShippings = (shippingsData || []).filter((shp: any) => !(shp.payment_method || '').toUpperCase().startsWith('CREDITO')).map((shp: any) => ({
      id: shp.id, date: shp.date, type: 'EGRESO' as const, sourceType: 'REMISIÓN' as const, documentNumber: shp.invoice_number, paymentMethod: shp.payment_method || 'EFECTIVO', mechanic: 'COMPRA INVENTARIO', entityName: shp.meka_suppliers?.name || 'Proveedor S/N', total: -Number(shp.total), discount: Number(shp.total_discount || 0), taxableBase: Number(shp.taxable_base || 0), ivaTotal: Number(shp.iva_total || 0), originalPayload: null
    }));

    const tCxc = (recData || []).map((rc: any) => ({
      id: rc.id, date: rc.payment_date, type: 'INGRESO' as const, sourceType: 'ABONO CXC' as const, documentNumber: rc['RC No.'] || 'S/N', paymentMethod: rc.payment_method, mechanic: `FA-${rc.receivable?.invoice?.invoice_number || 'S/N'}`, entityName: rc.receivable?.client?.name || 'Cliente', total: Number(rc.amount), discount: 0, taxableBase: 0, ivaTotal: 0, originalPayload: { ...rc, clientName: rc.receivable?.client?.name, clientIdNumber: rc.receivable?.client?.id_number, invoiceNumber: rc.receivable?.invoice?.invoice_number, total_amount: rc.receivable?.total_amount, paid_amount: Number(rc.receivable?.paid_amount) - Number(rc.amount) }
    }));

    const tCxp = (payData || []).map((pd: any) => ({
      id: pd.id, date: pd.payment_date, type: 'EGRESO' as const, sourceType: 'PAGO CXP' as const, documentNumber: pd['CE No.'] || 'S/N', paymentMethod: pd.payment_method, mechanic: `RE-${pd.payable?.shipping?.invoice_number || 'S/N'}`, entityName: pd.payable?.supplier?.name || 'Proveedor', total: -Number(pd.amount), discount: 0, taxableBase: 0, ivaTotal: 0, originalPayload: { ...pd, supplierName: pd.payable?.supplier?.name, supplierIdNumber: pd.payable?.supplier?.id_number, shippingNumber: pd.payable?.shipping?.invoice_number, total_amount: pd.payable?.total_amount, paid_amount: Number(pd.payable?.paid_amount) - Number(pd.amount) }
    }));

    const master = [...tInvoices, ...tShippings, ...tCxc, ...tCxp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      master,
      invoices: formattedInvoices,
      shippings: shippingsData || [],
      receivablePayments: recData || [],
      payablePayments: payData || []
    };
  },

  processAnalytics(data: { invoices: any[], inventory: any[], maintenance: any[] }) {
    const { invoices, inventory, maintenance } = data;

    // A. Critical Stock
    const criticalStock = inventory
      .filter(i => i.stock <= (i.stock_minimo || 0))
      .map(i => ({ name: i.name, stock: i.stock, minStock: i.stock_minimo || 0 }))
      .slice(0, 8);

    // B. Services
    const closedCount = maintenance.filter(m => m.status === 'closed').length;
    const openRecords = maintenance.filter(m => m.status === 'open');
    
    const openDetails = openRecords.map(m => {
      const clientName = (m.meka_clients && !Array.isArray(m.meka_clients) && m.meka_clients.name) 
        ? m.meka_clients.name 
        : 'Desconocido';
      
      return {
        plate: m.vehicle_plate || 'SIN PLACA',
        date: format(parseISO(m.created_at), 'dd/MM/yyyy'),
        clientName: clientName
      };
    });

    const servicesData = [
      { name: 'Abiertas', value: openRecords.length, details: openDetails },
      { name: 'Finalizadas', value: closedCount }
    ];

    // C. Daily Revenue
    const daily: Record<string, number> = {};
    invoices.forEach(inv => {
      const day = format(parseISO(inv.date), 'dd/MM');
      daily[day] = (daily[day] || 0) + Number(inv.total);
    });
    const dailyRevenue = Object.keys(daily)
      .map(k => ({ name: k, total: daily[k] }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // D. Top Products
    const prodSales: Record<string, number> = {};
    invoices.forEach(inv => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((it: any) => {
          prodSales[it.description] = (prodSales[it.description] || 0) + Number(it.quantity);
        });
      }
    });
    const topProducts = Object.keys(prodSales)
      .map(k => ({ name: k, count: prodSales[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { criticalStock, servicesData, dailyRevenue, topProducts };
  },

  // Plantillas de orden para asegurar que los reportes coincidan con la vista de la BD del usuario
  TABLE_ORDER: {
    'meka_shipping': ['created_at', 'date', 'items', 'payment_method', 'invoice_number', 'total_discount', 'taxable_base', 'iva_total', 'subtotal', 'total'],
    'meka_invoices': ['created_at', 'date', 'invoice_number', 'items', 'payment_type', 'total_discount', 'taxable_base', 'iva_total', 'subtotal', 'total', 'mekanico'],
    'meka_inventory': ['sku', 'name', 'category', 'stock', 'price', 'iva', 'stock_minimo', 'supplier', 'description'],
    'meka_clients': ['name', 'id_type', 'id_number', 'phone', 'email', 'address', 'discount'],
    'meka_payables': ['created_at', 'supplier_id', 'shipping_id', 'due_date', 'status', 'total_amount', 'paid_amount'],
    'meka_receivables': ['created_at', 'client_id', 'invoice_id', 'due_date', 'status', 'total_amount', 'paid_amount'],
    'meka_maintenance': ['created_at', 'client_id', 'vehicle_plate', 'status'],
    'meka_arqueos_caja': [
      'fecha_apertura', 'fecha_cierre', 'estado', 
      'apertura_efectivo', 'ventas_efectivo', 'cierre_efectivo', 
      'apertura_nequi', 'ventas_nequi', 'cierre_nequi',
      'apertura_daviplata', 'ventas_daviplata', 'cierre_daviplata',
      'diferencia_total', 'observaciones'
    ]
  } as Record<string, string[]>,

  forceOrder(tableName: string, row: any, orderNamesMapping: Record<string, string> = {}) {
    const template = this.TABLE_ORDER[tableName] || Object.keys(row);
    const orderedRow: any = {};
    
    // Primero, procesar las que están en el template
    template.forEach(key => {
      const displayKey = orderNamesMapping[key] || key;
      if (row.hasOwnProperty(key)) {
        orderedRow[displayKey] = row[key];
      }
    });

    // Luego, procesar cualquier llave extra que no estuviera en el template (excepto IDs y objetos relacionados internos)
    Object.keys(row).forEach(key => {
      if (!template.includes(key) && !key.toLowerCase().includes('id') && typeof row[key] !== 'object') {
        orderedRow[key] = row[key];
      }
    });

    return orderedRow;
  },

  async exportTable(tableName: string, tenantId: string, dateFrom: string, dateTo: string) {
    const fromISO = startOfDay(parseISO(dateFrom)).toISOString();
    const toISO = endOfDay(parseISO(dateTo)).toISOString();

    let query = supabase.from(tableName).select('*').eq('tenant_id', tenantId);
    
    const dateFields: Record<string, string> = {
      'meka_invoices': 'date',
      'meka_shipping': 'date',
      'meka_maintenance': 'created_at',
      'meka_inventory_flow': 'created_at'
    };

    if (dateFields[tableName]) {
      query = query.gte(dateFields[tableName], fromISO).lte(dateFields[tableName], toISO);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Filtrar y Ordenar
    return (data || []).map((row: any) => this.forceOrder(tableName, row));
  },

  async exportAccountingReport(reportType: string, tenantId: string) {
    const today = new Date();
    
    if (reportType === 'cuentas_pagar') {
      const { data, error } = await supabase
        .from('meka_payables')
        .select(`
          *,
          supplier:meka_suppliers(*),
          shipping:meka_shipping(invoice_number)
        `)
        .eq('tenant_id', tenantId)
        .neq('status', 'PAID');
        
      if (error) throw error;
      
      return (data || []).map(p => {
        const dueDate = p.due_date ? new Date(p.due_date) : null;
        let edad = 'N/A';
        if (dueDate) {
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          edad = diffDays > 0 ? `Vencida hace ${diffDays} días` : `Vence en ${Math.abs(diffDays)} días`;
        }
        
        const rowData = { ...p };
        // Mapeo dinámico para inyectar nombres en posiciones de IDs
        const mapping: Record<string, string> = {
          'supplier_id': 'Proveedor',
          'shipping_id': 'Documento Relacionado',
          'total_amount': 'Total Originado',
          'paid_amount': 'Abonado'
        };

        // Formatear valores específicos antes del ordenamiento
        if (rowData.supplier_id) rowData.supplier_id = p.supplier?.name || 'Desconocido';
        if (rowData.shipping_id) rowData.shipping_id = p.shipping?.invoice_number || 'N/A';
        if (rowData.total_amount) rowData.total_amount = Number(p.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        if (rowData.paid_amount) rowData.paid_amount = Number(p.paid_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

        const ordered = this.forceOrder('meka_payables', rowData, mapping);
        ordered['Saldo Pendiente'] = (Number(p.total_amount) - Number(p.paid_amount)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        ordered['Estado/Edad'] = edad;
        return ordered;
      });
    }
    
    if (reportType === 'cuentas_cobrar') {
      const { data, error } = await supabase
        .from('meka_receivables')
        .select(`
          *,
          client:meka_clients(*),
          invoice:meka_invoices(invoice_number)
        `)
        .eq('tenant_id', tenantId)
        .neq('status', 'PAID');
        
      if (error) throw error;
      
      return (data || []).map(r => {
        const dueDate = r.due_date ? new Date(r.due_date) : null;
        let edad = 'N/A';
        if (dueDate) {
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          edad = diffDays > 0 ? `Vencida hace ${diffDays} días` : `Vence en ${Math.abs(diffDays)} días`;
        }
        
        const rowData = { ...r };
        const mapping: Record<string, string> = {
          'client_id': 'Cliente',
          'invoice_id': 'Factura Relacionada',
          'total_amount': 'Total Originado',
          'paid_amount': 'Abonado'
        };

        if (rowData.client_id) rowData.client_id = r.client?.name || 'Desconocido';
        if (rowData.invoice_id) rowData.invoice_id = r.invoice?.invoice_number || 'N/A';
        if (rowData.total_amount) rowData.total_amount = Number(r.total_amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        if (rowData.paid_amount) rowData.paid_amount = Number(r.paid_amount || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

        const ordered = this.forceOrder('meka_receivables', rowData, mapping);
        ordered['Saldo Pendiente'] = (Number(r.total_amount) - Number(r.paid_amount || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        ordered['Estado/Edad'] = edad;
        return ordered;
      });
    }

    if (reportType === 'inventario_valorizado') {
      const { data, error } = await supabase
        .from('meka_inventory')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      let granTotal = 0;
      const mapping: Record<string, string> = {
        'price': 'Valor Unitario'
      };

      const formattedData = (data || []).map(i => {
        const valorUnitario = Number(i.price) || 0;
        const stockActual = Number(i.stock) || 0;
        const valorTotalItem = valorUnitario * stockActual;
        granTotal += valorTotalItem;
        
        const rowData = { ...i };
        if (rowData.price) rowData.price = valorUnitario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        
        const ordered = this.forceOrder('meka_inventory', rowData, mapping);
        ordered['Valor Total Activo'] = valorTotalItem.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        return ordered;
      });
      
      // Fila Totales (debe seguir la misma estructura de la base de datos)
      if (formattedData.length > 0) {
        const template = formattedData[0];
        const totalRow: any = {};
        Object.keys(template).forEach(key => {
          if (key === 'name' || key === 'Producto' || key === 'name') totalRow[key] = 'TOTAL VALORIZADO BODEGA';
          else if (key === 'Valor Total Activo') totalRow[key] = granTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
          else totalRow[key] = '';
        });
        formattedData.push(totalRow);
      }
      
      return formattedData;
    }
    
    return [];
  }
};
