import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountsService } from '../accountsService';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }))
  }
}));

describe('accountsService - Cuentas por Pagar y Cobrar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cuentas por Cobrar (Receivables) & Recibos de Caja', () => {
    it('debe registrar un abono (Recibo de Caja) y actualizar la deuda maestra', async () => {
      const mockPaymentData = {
        tenant_id: 'tenant-123',
        receivable_id: 'cxc-123',
        amount: 50000,
        payment_method: 'EFECTIVO',
        notes: 'Abono inicial',
        "RC No.": 'RC-000001'
      };

      // Mock para la inserción del pago
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'pay-1', ...mockPaymentData }, error: null })
      });

      // Mock para traer la cuenta actual
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'cxc-123', total_amount: 100000, paid_amount: 0, status: 'PENDING' }, 
          error: null 
        })
      });

      // Mock para actualizar la cuenta maestra
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'meka_receivable_payments') return { insert: mockInsert };
        if (table === 'meka_receivables') return { select: mockSelect, update: mockUpdate };
        return {};
      });

      const result = await accountsService.addReceivablePayment(mockPaymentData);

      expect(supabase.from).toHaveBeenCalledWith('meka_receivable_payments');
      expect(supabase.from).toHaveBeenCalledWith('meka_receivables');
      expect(mockUpdate).toHaveBeenCalledWith({
        paid_amount: 50000,
        status: 'PARTIAL'
      });
      expect(result['RC No.']).toBe('RC-000001');
    });
  });

  describe('Cuentas por Pagar (Payables) & Comprobantes de Egreso', () => {
    it('debe registrar un pago (Comprobante de Egreso) y liquidar la deuda si el monto es total', async () => {
      const mockPaymentData = {
        tenant_id: 'tenant-123',
        payable_id: 'cxp-123',
        amount: 150000,
        payment_method: 'TRANSFERENCIA',
        notes: 'Pago total mercancia',
        "CE No.": 'CE-000001'
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'pay-2', ...mockPaymentData }, error: null })
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'cxp-123', total_amount: 150000, paid_amount: 0, status: 'PENDING' }, 
          error: null 
        })
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'meka_payable_payments') return { insert: mockInsert };
        if (table === 'meka_payables') return { select: mockSelect, update: mockUpdate };
        return {};
      });

      const result = await accountsService.addPayablePayment(mockPaymentData);

      expect(supabase.from).toHaveBeenCalledWith('meka_payable_payments');
      expect(mockUpdate).toHaveBeenCalledWith({
        paid_amount: 150000,
        status: 'PAID'
      });
      expect(result['CE No.']).toBe('CE-000001');
    });
  });
});
