import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../services/invoiceService';
import { Tenant, InvoiceItem } from '../../types';
import { inventoryKeys } from './useInventoryQuery';
import { maintenanceKeys } from './useMaintenanceQuery';
import { accountKeys } from './useAccountsQuery';

export const invoicingKeys = {
  all: ['invoicing'] as const,
  openMaintenance: (tenantId: string, clientId: string) => [...invoicingKeys.all, 'open-maintenance', tenantId, clientId] as const,
};

export function useOpenMaintenanceModules(tenantId: string, clientId: string) {
  return useQuery({
    queryKey: invoicingKeys.openMaintenance(tenantId || '', clientId || ''),
    queryFn: () => invoiceService.getOpenMaintenanceModules(tenantId!, clientId!),
    enabled: !!tenantId && !!clientId,
  });
}

export function useSaveInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      tenant: Tenant;
      clientId: string;
      clientInfo: any;
      invoiceNumber: string;
      items: InvoiceItem[];
      totals: {
        subtotal: number;
        discount: number;
        iva: number;
        total: number;
      };
      paymentType: string;
      mechanic?: string;
      maintenanceId?: string;
    }) => invoiceService.saveInvoiceAndProcess(params),
    onSuccess: (_, variables) => {
      // Invalidar caché de forma masiva ya que una factura afecta casi todo
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all }); // Stock cambió
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all }); // Mantenimiento se cerró
      queryClient.invalidateQueries({ queryKey: accountKeys.all }); // Si fue a crédito, CXC cambió
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Venta diaria cambió
      queryClient.invalidateQueries({ queryKey: ['clients'] }); // Si el cliente era nuevo
      queryClient.invalidateQueries({ queryKey: ['tenant'] }); // El número de factura cambió
    },
  });
}
