import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../../services/accountsService';
import { ReceivablePayment, PayablePayment, ArqueoCaja } from '../../types';

export const accountKeys = {
  all: ['accounts'] as const,
  receivables: (tenantId: string) => [...accountKeys.all, 'receivables', tenantId] as const,
  payables: (tenantId: string) => [...accountKeys.all, 'payables', tenantId] as const,
  receipts: (tenantId: string, type: 'RC' | 'CE') => [...accountKeys.all, 'receipts', type, tenantId] as const,
};

export function useReceivables(tenantId: string) {
  return useQuery({
    queryKey: accountKeys.receivables(tenantId || ''),
    queryFn: () => accountsService.getReceivables(tenantId!),
    enabled: !!tenantId,
  });
}

export function usePayables(tenantId: string) {
  return useQuery({
    queryKey: accountKeys.payables(tenantId || ''),
    queryFn: () => accountsService.getPayables(tenantId!),
    enabled: !!tenantId,
  });
}

export function useNextReceiptNumber(tenantId: string, type: 'RC' | 'CE') {
  return useQuery({
    queryKey: accountKeys.receipts(tenantId || '', type),
    queryFn: () => type === 'RC' 
      ? accountsService.getNextReceivableReceiptNumber(tenantId!)
      : accountsService.getNextPayableReceiptNumber(tenantId!),
    enabled: !!tenantId,
  });
}

export function useAddReceivablePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ReceivablePayment, 'id' | 'payment_date'>) => 
      accountsService.addReceivablePayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.receivables(variables.tenant_id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.receipts(variables.tenant_id, 'RC') });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Afecta el arqueo de caja
    },
  });
}

export function useAddPayablePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PayablePayment, 'id' | 'payment_date'>) => 
      accountsService.addPayablePayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.payables(variables.tenant_id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.receipts(variables.tenant_id, 'CE') });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Afecta el arqueo de caja
    },
  });
}
