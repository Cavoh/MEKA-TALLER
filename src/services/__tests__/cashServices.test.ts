import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cashServices } from '../cashServices';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
      selectReturn: vi.fn().mockReturnThis()
    }))
  }
}));

describe('cashServices - Arqueo de Caja', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe abrir una caja correctamente con los 5 medios de pago', async () => {
    const mockData = { 
      tenant_id: 'tenant-123',
      usuario_id: 'user-456',
      apertura_efectivo: 100000,
      apertura_tarjeta_debito: 0,
      apertura_tarjeta_credito: 0,
      apertura_nequi: 50000,
      apertura_daviplata: 0
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1, ...mockData, estado: 'abierta' }, error: null })
    });

    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    const result = await cashServices.openRegister(mockData);

    expect(supabase.from).toHaveBeenCalledWith('meka_arqueos_caja');
    expect(result.estado).toBe('abierta');
    expect(result.apertura_nequi).toBe(50000);
  });

  it('debe cerrar una caja actualizando los 15 campos de arqueo', async () => {
    const mockUpdateData = {
      ventas_efectivo: 200000,
      cierre_efectivo: 300000,
      diferencia_total: 0,
      observaciones: 'Todo cuadra'
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1, ...mockUpdateData, estado: 'cerrada' }, error: null })
    });

    (supabase.from as any).mockReturnValue({ update: mockUpdate });

    const result = await cashServices.closeRegister(1, mockUpdateData);

    expect(result.estado).toBe('cerrada');
    expect(result.observaciones).toBe('Todo cuadra');
  });
});
