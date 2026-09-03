import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportService } from '../reportService';
import { supabase } from '../../supabase';

const buildChain = (resolveData: any) => {
  const result = { data: resolveData, error: null };
  // Una promesa que resuelve a { data, error } y cuyos métodos encadenables
  // (select, eq, neq, order, gte, lte, single) retornan la MISMA promesa,
  // permitiendo `supabase.from().select().eq().neq()` y su `await`.
  let promise: any = Promise.resolve(result);
  ['select', 'eq', 'neq', 'order', 'gte', 'lte'].forEach(method => {
    const fn = vi.fn(() => promise);
    promise[method] = fn;
  });
  promise.single = vi.fn(async () => result);
  return promise;
};

vi.mock('../../supabase', () => ({
  supabase: { from: vi.fn() }
}));

describe('reportService - Reportes y Exportaciones Financieras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('procesa analytics: calcula stock crítico, servicios abiertos/finalizados, ventas diarias y top productos', () => {
    const invoicesWithItems = [
      {
        date: '2026-01-05',
        total: 100000,
        items: [
          { description: 'Aceite', quantity: 2 },
          { description: 'Filtro', quantity: 1 }
        ]
      },
      {
        date: '2026-01-05',
        total: 50000,
        items: [{ description: 'Aceite', quantity: 1 }]
      },
      { date: '2026-01-07', total: 30000, items: [] }
    ];

    const inventory = [
      { name: 'Aceite', stock: 3, stock_minimo: 5 },
      { name: 'Filtro', stock: 10, stock_minimo: 2 },
      { name: 'Freno', stock: 1, stock_minimo: 4 }
    ];

    const maintenance = [
      { status: 'closed', created_at: '2026-01-05T10:00:00Z', vehicle_plate: 'AAA111', meka_clients: { name: 'Cliente A' } },
      { status: 'open', created_at: '2026-01-06T10:00:00Z', vehicle_plate: 'BBB222', meka_clients: { name: 'Cliente B' } },
      { status: 'open', created_at: '2026-01-07T10:00:00Z', vehicle_plate: 'CCC333', meka_clients: { name: null } }
    ];

    const result = reportService.processAnalytics({ invoices: invoicesWithItems, inventory, maintenance });

    expect(result.criticalStock).toHaveLength(2);
    expect(result.criticalStock.map(c => c.name)).toEqual(['Aceite', 'Freno']);

    const servicios = result.servicesData;
    const abiertas = servicios.find(s => s.name === 'Abiertas');
    const finalizadas = servicios.find(s => s.name === 'Finalizadas');
    expect(abiertas?.value).toBe(2);
    expect(finalizadas?.value).toBe(1);
    expect(abiertas?.details).toHaveLength(2);

    const venta0501 = result.dailyRevenue.find(d => d.name === '05/01');
    expect(venta0501?.total).toBe(150000);

    expect(result.topProducts[0]).toEqual({ name: 'Aceite', count: 3 });
  });

  it('exporta Cuentas por Pagar excluyendo cuentas PAID (usa .neq status) y calcula saldo pendiente y edad', async () => {
    const payables = [
      {
        id: 'p1',
        supplier: { name: 'Distribuidora XYZ' },
        shipping: { invoice_number: 'RE-001' },
        tenant_id: 'tenant-123',
        supplier_id: 'sup-1',
        shipping_id: 'ship-1',
        due_date: null,
        status: 'UNPAID',
        total_amount: 200000,
        paid_amount: 50000
      },
      {
        id: 'p2',
        supplier: { name: 'Autopartes ABC' },
        shipping: { invoice_number: 'RE-002' },
        tenant_id: 'tenant-123',
        supplier_id: 'sup-2',
        shipping_id: 'ship-2',
        due_date: '2026-01-01',
        status: 'PARTIAL',
        total_amount: 100000,
        paid_amount: 20000
      }
    ];

    (supabase.from as any).mockReturnValue(buildChain(payables));

    const result = await reportService.exportAccountingReport('cuentas_pagar', 'tenant-123');

    expect(supabase.from).toHaveBeenCalledWith('meka_payables');
    // Debe llamar a .neq('status','PAID') para excluir cuentas liquidadas
    const chain = (supabase.from as any).mock.results[0].value;
    expect(chain.neq).toHaveBeenCalledWith('status', 'PAID');

    expect(result).toHaveLength(2);
    expect(result[0]['Proveedor']).toBe('Distribuidora XYZ');
    expect(result[0]['Documento Relacionado']).toBe('RE-001');
    expect(result[0]['Saldo Pendiente']).toContain('150.000');
    expect(result[0]['Estado/Edad']).toBe('N/A');
    expect(result[1]['Saldo Pendiente']).toContain('80.000');
  });

  it('exporta Cuentas por Cobrar excluyendo cuentas PAID (usa .neq status) e inyecta nombre de cliente', async () => {
    const receivables = [
      {
        id: 'r1',
        client: { name: 'Cliente Juan' },
        invoice: { invoice_number: 'FA-100' },
        tenant_id: 'tenant-123',
        client_id: 'cli-1',
        invoice_id: 'inv-1',
        due_date: null,
        status: 'UNPAID',
        total_amount: 500000,
        paid_amount: 200000
      }
    ];

    (supabase.from as any).mockReturnValue(buildChain(receivables));

    const result = await reportService.exportAccountingReport('cuentas_cobrar', 'tenant-123');

    expect(supabase.from).toHaveBeenCalledWith('meka_receivables');
    const chain = (supabase.from as any).mock.results[0].value;
    expect(chain.neq).toHaveBeenCalledWith('status', 'PAID');

    expect(result).toHaveLength(1);
    expect(result[0]['Cliente']).toBe('Cliente Juan');
    expect(result[0]['Factura Relacionada']).toBe('FA-100');
    expect(result[0]['Saldo Pendiente']).toContain('300.000');
  });

  it('exporta inventario valorizado calculando total del activo (precio * stock)', async () => {
    const inventory = [
      { id: 'i1', tenant_id: 'tenant-123', category: 'Lubricantes', name: 'Aceite', sku: 'A1', price: 10000, stock: 5, iva: 0, stock_minimo: 2, supplier: 'S1' },
      { id: 'i2', tenant_id: 'tenant-123', category: 'Frenos', name: 'Pastilla', sku: 'B1', price: 20000, stock: 3, iva: 0, stock_minimo: 1, supplier: 'S2' }
    ];

    (supabase.from as any).mockReturnValue(buildChain(inventory));

    const result = await reportService.exportAccountingReport('inventario_valorizado', 'tenant-123');

    expect(result).toHaveLength(3); // 2 items + fila TOTAL
    const totalRow = result[2];
    expect(totalRow['Valor Total Activo']).toContain('110.000'); // 10000*5 + 20000*3
    expect(totalRow['name'] || totalRow['Producto']).toBe('TOTAL VALORIZADO BODEGA');
  });
});