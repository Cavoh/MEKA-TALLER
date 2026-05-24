import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InventoryTab from '../InventoryTab';
import { WorkshopContext } from '../../../context/WorkshopContext';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock de Lucide
vi.mock('lucide-react', () => ({
  Plus: () => <div />,
  Search: () => <div />,
  ArrowUpRight: () => <div />,
  ArrowDownLeft: () => <div />,
  Wrench: () => <div />,
  ChevronDown: () => <div />,
  Edit2: () => <div />,
  Trash2: () => <div />,
  CircleAlert: () => <div />,
  CheckCircle2: () => <div />,
  AlertCircle: () => <div />,
  Info: () => <div />,
  X: () => <div />,
}));

// Mock de componentes
vi.mock('../InventoryTable', () => ({ InventoryTable: () => <div data-testid="mock-table" /> }));
vi.mock('../InventoryFormModal', () => ({ InventoryFormModal: () => <div /> }));
vi.mock('../StockMovementModal', () => ({ StockMovementModal: () => <div /> }));
vi.mock('../../../components/ConfirmModal', () => ({ default: () => <div /> }));
vi.mock('../../../components/ToastProvider', () => ({ 
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn(), showInfo: vi.fn() }),
  ToastProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock de hooks
vi.mock('../../../hooks/useSearchPagination', () => ({
  useSearchPagination: () => ({
    search: '', setSearch: vi.fn(), debouncedSearch: '', page: 0, setPage: vi.fn(), pageSize: 10
  })
}));

vi.mock('../../../hooks/useFormModal', () => ({
  useFormModal: () => ({
    isOpen: false, editingItem: null, formData: {}, setFormData: vi.fn(), openModal: vi.fn(), closeModal: vi.fn(), handleChange: vi.fn()
  })
}));

vi.mock('../../../hooks/queries/useInventoryQuery', () => ({
  useInventory: vi.fn().mockReturnValue({ data: { data: [], count: 0 }, isLoading: false }),
  useCategories: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useProductsByCategory: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useSaveInventoryItem: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useDeleteInventoryItem: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useRecordMovement: vi.fn().mockReturnValue({ mutateAsync: vi.fn() })
}));

describe('InventoryTab - Isolation Test', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const mockContext = { 
    tenant: { id: 't1', name: 'Test Shop', address: '', phone: '', email: '', invoiceConfig: { fields: [], designId: 'standard' } },
    showSuccess: vi.fn(),
    showError: vi.fn(),
    visibleTabs: [], // Added missing prop
    staff: { id: 's1', tenantId: 't1', nombre: 'Admin', rolId: 'ADMIN', contrasena: '', rolName: 'ADMIN' },
    permissions: [],
    hasActionPermission: () => true,
    activeTab: 'INVENTARIO',
    setActiveTab: vi.fn(),
    isSettingsOpen: false,
    setIsSettingsOpen: vi.fn(),
    isAppearanceOpen: false,
    setIsAppearanceOpen: vi.fn(),
    user: null,
    showInfo: vi.fn(), // Added missing prop
    logout: vi.fn(),
    switchStaff: vi.fn()
  };

  it('debe montar el componente y mostrar la barra de acciones', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WorkshopContext.Provider value={mockContext}>
          <InventoryTab />
        </WorkshopContext.Provider>
      </QueryClientProvider>
    );
    
    // Verificar que el buscador está presente (barra de acciones)
    expect(screen.getByPlaceholderText(/Buscar producto/i)).toBeInTheDocument();
  });

  it('debe mostrar los botones de acción principales', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WorkshopContext.Provider value={mockContext}>
          <InventoryTab />
        </WorkshopContext.Provider>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Nuevo Producto/i)).toBeInTheDocument();
    expect(screen.getByText(/Entradas/i)).toBeInTheDocument();
    expect(screen.getByText(/Salidas/i)).toBeInTheDocument();
  });
});
