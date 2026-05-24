import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../../services/reportService';
import { cashServices } from '../../services/cashServices';
import { ArqueoCaja } from '../../types';

export const reportKeys = {
  all: ['reports'] as const,
  analytics: (tenantId: string, from: string, to: string) => [...reportKeys.all, 'analytics', { tenantId, from, to }] as const,
  transactions: (tenantId: string, from: string, to: string) => [...reportKeys.all, 'transactions', { tenantId, from, to }] as const,
  cash: (tenantId: string) => [...reportKeys.all, 'cash', tenantId] as const,
  currentCash: (tenantId: string) => [...reportKeys.cash(tenantId), 'current'] as const,
};

export function useAnalytics(tenantId: string, from: string, to: string) {
  return useQuery({
    queryKey: reportKeys.analytics(tenantId || '', from, to),
    queryFn: () => reportService.fetchAnalytics(tenantId!, from, to),
    enabled: !!tenantId,
  });
}

export function useUnifiedTransactions(tenantId: string, from: string, to: string) {
  return useQuery({
    queryKey: reportKeys.transactions(tenantId || '', from, to),
    queryFn: () => reportService.fetchUnifiedTransactions(tenantId!, from, to),
    enabled: !!tenantId,
  });
}

export function useCurrentCashRegister(tenantId: string) {
  return useQuery({
    queryKey: reportKeys.currentCash(tenantId || ''),
    queryFn: () => cashServices.getCurrentOpenRegister(tenantId!),
    enabled: !!tenantId,
  });
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof cashServices.openRegister>[0]) => 
      cashServices.openRegister(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.cash(variables.tenant_id) });
    },
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, tenantId }: { id: number, data: Partial<ArqueoCaja>, tenantId: string }) => 
      cashServices.closeRegister(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.cash(variables.tenantId) });
      // También invalidar reportes ya que el cierre de caja puede afectar métricas o auditorías
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
