import { describe, it, expect, vi } from 'vitest';
import { inventoryService } from '../inventoryService';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

describe('inventoryService - Lógica de Almacén', () => {
  const tenantId = 'test-tenant-123';

  it('debe registrar un movimiento de entrada correctamente vía RPC', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: 15, error: null });

    await inventoryService.recordMovement({
      tenantId,
      itemId: 'prod-1',
      sku: 'SKU123',
      amount: 10,
      type: 'ENTRADA',
      description: 'Lote nuevo'
    });

    expect(supabase.rpc).toHaveBeenCalledWith('meka_adjust_stock', expect.objectContaining({
      p_item_id: 'prod-1',
      p_amount: 10,
      p_type: 'ENTRADA'
    }));
  });

  it('debe registrar una salida restando el stock vía RPC', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: 15, error: null });

    await inventoryService.recordMovement({
      tenantId,
      itemId: 'prod-2',
      sku: 'SKU456',
      amount: -5,
      type: 'SALIDA',
      description: 'Venta manual'
    });

    expect(supabase.rpc).toHaveBeenCalledWith('meka_adjust_stock', expect.objectContaining({
      p_item_id: 'prod-2',
      p_amount: -5,
      p_type: 'SALIDA'
    }));
  });

  it('debe filtrar categorías únicas', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: [{ category: 'Aceites' }, { category: 'Filtros' }, { category: 'Aceites' }], 
        error: null 
      })
    });

    const categories = await inventoryService.getCategories(tenantId);
    expect(categories).toEqual(['Aceites', 'Filtros']);
  });
});
