import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PurchasesTab from '../PurchasesTab';
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
vi.mock('../SupplierSection', () => ({ SupplierSection: () => <div data-testid="mock-supplier" /> }));
vi.mock('../PurchaseFormTable', () => ({ PurchaseFormTable: () => <div data-testid="mock-table" /> }));
vi.mock('../PurchaseSummary', () => ({ PurchaseSummary: () => <div data-testid="mock-summary" /> }));
vi.mock('../../components/ToastProvider', () => ({ 
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn(), showInfo: vi.fn() }),
  ToastProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock Hooks
vi.mock('../../../hooks/queries/useInventoryQuery', () => ({
  useInventory: vi.fn().mockReturnValue({ data: { data: [], count: 0 }, isLoading: false }),
}));

vi.mock('../../../hooks/queries/usePurchasesQuery', () => ({
  useNextShippingNumber: vi.fn().mockReturnValue({ data: '000001' }),
  useSavePurchase: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useCreateSupplier: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useSupplierById: vi.fn().mockReturnValue({ data: null })
}));

describe('PurchasesTab - Isolation Test', () => {
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

  it('renderiza la estructura base del formulario de compras sin crashear', () => {
    const { getByTestId } = renderWithProviders(<PurchasesTab />);
    expect(getByTestId('mock-supplier')).toBeDefined();
    expect(getByTestId('mock-table')).toBeDefined();
    expect(getByTestId('mock-summary')).toBeDefined();
  });
});
