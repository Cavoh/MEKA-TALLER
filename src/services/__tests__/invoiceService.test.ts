import { describe, it, expect, vi } from 'vitest';
import { invoiceService } from '../invoiceService';
import { supabase } from '../../supabase';

// Mock de dependencias si es necesario (supabase ya está importado en el servicio)
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('invoiceService - Cálculos de Facturación', () => {
  it('debe procesar los items de mantenimiento correctamente con descuento de cliente', () => {
    const history = [
      {
        items: [
          { name: 'Filtro de Aceite', quantity: 1, price: 50000, iva: 19 },
          { name: 'Aceite sintético', quantity: 4, price: 30000, iva: 19 }
        ],
        laborDescription: 'Cambio de aceite',
        laborCost: 20000
      }
    ];

    const inventory: any[] = [
      { name: 'Filtro de Aceite', sku: 'SKU-FA', price: 50000 },
      { name: 'Aceite sintético', sku: 'SKU-AC', price: 30000 }
    ];

    const clientDiscount = 10; // 10% de descuento

    const result = invoiceService.processMaintenanceItems(history, inventory, clientDiscount);

    // Verificaciones
    expect(result).toHaveLength(3); // 2 productos + 1 mano de obra
    
    // Producto 1: Filtro (50,000 * 1 * 0.9 = 45,000)
    expect(result[0].total).toBe(45000);
    expect(result[0].sku).toBe('SKU-FA');

    // Producto 2: Aceite (30,000 * 4 * 0.9 = 108,000)
    expect(result[1].total).toBe(108000);

    // Mano de Obra: No aplica descuento de cliente según la implementación actual (ver invoiceService.ts)
    expect(result[2].total).toBe(20000);
    expect(result[2].description).toContain('Cambio de aceite');
  });

  it('debe calcular el siguiente número de factura recuperando el valor actual de la DB', async () => {
    const mockTenant = { id: 'tenant-1', invoice_prefix: 'FAC', invoice_next_number: 10 };
    
    // Mock para RPC (incremento atómico)
    const mockRpc = vi.fn().mockResolvedValue({ 
      data: 11, 
      error: null 
    });

    // Mock para INSERT (la factura nueva)
    const mockInsert = vi.fn().mockResolvedValue({ 
      data: [{ id: 'inv-1', total: 1000 }], 
      error: null 
    });

    // Actualizar el mock global de supabase para incluir rpc
    (supabase as any).rpc = mockRpc;
    (supabase as any).from = vi.fn().mockImplementation((table: string) => {
      if (table === 'meka_invoices') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: mockInsert
        };
      }
      // Fallback para otros (inventory, etc)
      return { 
        select: vi.fn().mockReturnThis(), 
        eq: vi.fn().mockReturnThis(), 
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockResolvedValue({ error: null })
      };
    });

    const result = await invoiceService.saveInvoiceAndProcess({
      tenant: mockTenant as any,
      clientId: 'client-1',
      clientInfo: {},
      invoiceNumber: 'FAC000010',
      items: [],
      totals: { subtotal: 0, discount: 0, iva: 0, total: 0 },
      paymentType: 'NEQUI'
    });

    expect(result.nextInvoiceVal).toBe(11);
    expect(mockRpc).toHaveBeenCalledWith('increment_invoice_number', { p_tenant_id: 'tenant-1' });
  });

  it('debe manejar historiales vacíos sin romper', () => {
    const result = invoiceService.processMaintenanceItems([], [], 0);
    expect(result).toEqual([]);
  });
});
