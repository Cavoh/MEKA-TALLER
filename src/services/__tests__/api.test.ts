import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventoryService';
import { supabase } from '../../supabase';

// Mock de Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ 
                data: [{ id: '1', name: 'Item Test', stock: 10, price: 100, tenant_id: 't1' }], 
                error: null, 
                count: 1 
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('API Service - inventoryService', () => {
  it('debe buscar items en el inventario correctamente', async () => {
    const result = await inventoryService.searchInventory('t1', '');
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Item Test');
    expect(supabase.from).toHaveBeenCalledWith('meka_inventory');
  });

  it('debe mapear los campos de la base de datos a la interfaz de la app', async () => {
      const result = await inventoryService.searchInventory('t1', '');
      const item = result.data[0];
      
      expect(item).toHaveProperty('tenantId');
      expect(item.tenantId).toBe('t1');
      expect(typeof item.price).toBe('number');
  });
});
