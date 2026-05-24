import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseService } from '../../services/purchaseService';
import { Supplier } from '../../types';

export const purchaseKeys = {
  all: ['purchases'] as const,
  suppliers: (tenantId: string) => [...purchaseKeys.all, 'suppliers', tenantId] as const,
  supplierById: (tenantId: string, idNumber: string) => [...purchaseKeys.all, 'supplier', { tenantId, idNumber }] as const,
  nextNumber: (tenantId: string) => [...purchaseKeys.all, 'nextNumber', tenantId] as const,
};

export function useSuppliers(tenantId: string) {
  return useQuery({
    queryKey: purchaseKeys.suppliers(tenantId || ''),
    queryFn: () => purchaseService.getAllSuppliers(tenantId!),
    enabled: !!tenantId,
  });
}

export function useSupplierById(tenantId: string, idNumber: string) {
  return useQuery({
    queryKey: purchaseKeys.supplierById(tenantId || '', idNumber),
    queryFn: () => purchaseService.searchSupplier(tenantId!, idNumber),
    enabled: !!tenantId && idNumber.length > 3,
  });
}

export function useNextShippingNumber(tenantId: string) {
  return useQuery({
    queryKey: purchaseKeys.nextNumber(tenantId || ''),
    queryFn: () => purchaseService.getNextShippingNumber(tenantId!),
    enabled: !!tenantId,
  });
}

export function useSavePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Parameters<typeof purchaseService.savePurchase>[0]) => 
      purchaseService.savePurchase(params),
    onSuccess: (_, variables) => {
      // Invalidar caché de inventario y de números de compra
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.nextNumber(variables.tenantId) });
      // También invalidar reportes ya que se guardó una compra
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, supplierData }: { tenantId: string, supplierData: any }) => 
      purchaseService.createSupplier(tenantId, supplierData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.suppliers(variables.tenantId) });
    },
  });
}
