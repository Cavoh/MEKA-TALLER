import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../../services/maintenanceService';
import { MaintenanceHistory } from '../../types';

export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  records: (tenantId: string, from: string, to: string, page: number, clientId?: string) =>
    [...maintenanceKeys.lists(), 'records', { tenantId, from, to, page, clientId }] as const,
};

/**
 * Hook unificado: filtra siempre por fechas y opcionalmente por cliente.
 * Esto garantiza que el historial de un cliente respete el rango de fechas activo.
 */
export function useMaintenanceRecords(
  tenantId: string,
  dateFrom: string,
  dateTo: string,
  page: number,
  pageSize: number,
  clientId?: string
) {
  return useQuery({
    queryKey: maintenanceKeys.records(tenantId || '', dateFrom, dateTo, page, clientId),
    queryFn: () => maintenanceService.getRecords(tenantId!, dateFrom, dateTo, page, pageSize, clientId),
    enabled: !!tenantId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, clientId, plate, mechanicName }: { tenantId: string, clientId: string, plate: string, mechanicName: string | null }) => 
      maintenanceService.createVehicle(tenantId, clientId, plate, mechanicName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useAddHistoryModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, clientId, plate, mechanicName }: { tenantId: string, clientId: string, plate: string, mechanicName: string }) => 
      maintenanceService.addHistoryModule(tenantId, clientId, plate, mechanicName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useUpdateHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, history }: { recordId: string, history: MaintenanceHistory[] }) => 
      maintenanceService.updateHistory(recordId, history),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useUpdateSingleModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, moduleId, updatedData }: { recordId: string, moduleId: string, updatedData: Partial<MaintenanceHistory> }) => 
      maintenanceService.updateSingleModule(recordId, moduleId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useRemoveSingleModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, moduleId }: { recordId: string, moduleId: string }) => 
      maintenanceService.removeSingleModule(recordId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useDeleteMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) => maintenanceService.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}
