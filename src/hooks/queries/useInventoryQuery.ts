import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (tenantId: string, query: string, page: number) => [...inventoryKeys.lists(), { tenantId, query, page }] as const,
  categories: (tenantId: string) => [...inventoryKeys.all, 'categories', tenantId] as const,
  byCategory: (tenantId: string, category: string) => [...inventoryKeys.all, 'byCategory', { tenantId, category }] as const,
};

export function useInventory(tenantId: string, query: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: inventoryKeys.list(tenantId, query, page),
    queryFn: () => inventoryService.searchInventory(tenantId, query, page, pageSize),
    enabled: !!tenantId,
  });
}

export function useCategories(tenantId: string) {
  return useQuery({
    queryKey: inventoryKeys.categories(tenantId),
    queryFn: () => inventoryService.getCategories(tenantId),
    enabled: !!tenantId,
  });
}

export function useProductsByCategory(tenantId: string, category: string) {
  return useQuery({
    queryKey: inventoryKeys.byCategory(tenantId, category),
    queryFn: () => inventoryService.getProductsByCategory(tenantId, category),
    enabled: !!tenantId && !!category,
  });
}

export function useSaveInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, itemData, itemId }: { tenantId: string, itemData: any, itemId?: string }) => 
      inventoryService.saveItem(tenantId, itemData, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => inventoryService.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Parameters<typeof inventoryService.recordMovement>[0]) =>
      inventoryService.recordMovement(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error: Error) => {
      // Error is surfaced to the component via mutation.error — no global side effects here.
      throw error;
    },
  });
}
