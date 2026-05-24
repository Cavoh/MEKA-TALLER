import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InvoicingTab from '../InvoicingTab';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkshopContext } from '../../../context/WorkshopContext';

// Mock de UI base
vi.mock('lucide-react', () => ({
  Plus: () => <div />,
  Search: () => <div />,
  DollarSign: () => <div />,
  CreditCard: () => <div />,
  ChevronDown: () => <div />,
  X: () => <div />,
}));

// Mock Componentes
vi.mock('../InvoiceClientSection', () => ({ InvoiceClientSection: () => <div data-testid="mock-client" /> }));
vi.mock('../InvoiceItemTable', () => ({ InvoiceItemTable: () => <div data-testid="mock-table" /> }));
vi.mock('../InvoiceSummary', () => ({ InvoiceSummary: () => <div data-testid="mock-summary" /> }));
vi.mock('../../components/ToastProvider', () => ({ 
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn(), showInfo: vi.fn() }),
  ToastProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock Hooks
vi.mock('../../../hooks/queries/useInventoryQuery', () => ({
  useInventory: vi.fn().mockReturnValue({ data: { data: [], count: 0 }, isLoading: false }),
}));

vi.mock('../../../hooks/queries/usePersonnelQuery', () => ({
  usePersonnel: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock('../../../hooks/queries/useReportsQuery', () => ({
  useCurrentCashRegister: vi.fn().mockReturnValue({ data: { id: 'caja-1', estado: 'ABIERTA' } }),
}));

vi.mock('../../../hooks/queries/useInvoicingQuery', () => ({
  useOpenMaintenanceModules: vi.fn().mockReturnValue({ data: [] }),
  useSaveInvoice: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('InvoicingTab - Isolation Test', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const mockContext: any = {
      tenant: { id: 'test-tenant' },
      user: { id: 'test-user' }
    };
    return render(
      <QueryClientProvider client={queryClient}>
        <WorkshopContext.Provider value={mockContext}>
          {ui}
        </WorkshopContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renderiza la estructura base del formulario de facturacion sin crashear', () => {
    const { getByTestId } = renderWithProviders(<InvoicingTab />);
    expect(getByTestId('mock-client')).toBeDefined();
    expect(getByTestId('mock-table')).toBeDefined();
    expect(getByTestId('mock-summary')).toBeDefined();
  });
});
