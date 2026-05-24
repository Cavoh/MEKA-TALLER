import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (tenantId: string, query: string, page: number) => [...clientKeys.lists(), { tenantId, query, page }] as const,
};

export function useClients(tenantId: string, query: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: clientKeys.list(tenantId, query, page),
    queryFn: () => clientService.searchClients(tenantId, query, page, pageSize),
    enabled: !!tenantId,
  });
}

export function useSaveClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, clientData, clientId }: { tenantId: string, clientData: any, clientId?: string }) => 
      clientService.saveClient(tenantId, clientData, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => clientService.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
