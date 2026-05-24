/**
 * @file MaintenanceTab.test.tsx
 * @description Suite de pruebas de integración para el componente MaintenanceTab.
 *
 * Notas de diseño:
 * - useSearchPagination NO se mockea — usa el hook real (solo useState + debounce)
 * - La comparación de fechas usa format() de date-fns para coincidir con el componente
 * - Los tests de búsqueda teclean en el input real (el hook real actualiza el estado)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkshopContext } from '../../../context/WorkshopContext';
import { format } from 'date-fns';
import MaintenanceTab from '../MaintenanceTab';

// ─── vi.hoisted ───────────────────────────────────────────────────────────────
const {
  mockShowSuccess,
  mockShowError,
  mockShowInfo,
  mockSupabaseFrom,
  mockUseMaintenanceRecords,
} = vi.hoisted(() => {
  const mockSupabaseFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }));

  const mockUseMaintenanceRecords = vi.fn().mockReturnValue({
    data: { data: [], count: 0 },
    isLoading: false,
  });

  return {
    mockShowSuccess: vi.fn(),
    mockShowError:   vi.fn(),
    mockShowInfo:    vi.fn(),
    mockSupabaseFrom,
    mockUseMaintenanceRecords,
  };
});

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('lucide-react', () => ({
  Car:          () => <span data-testid="icon-car" />,
  History:      () => <span data-testid="icon-history" />,
  Plus:         () => <span data-testid="icon-plus" />,
  Search:       () => <span data-testid="icon-search" />,
  X:            () => <span data-testid="icon-x" />,
  Calendar:     () => <span data-testid="icon-calendar" />,
  UserRound:    () => <span data-testid="icon-user" />,
  Camera:       () => <span data-testid="icon-camera" />,
  Trash2:       () => <span data-testid="icon-trash2" />,
  Trash:        () => <span data-testid="icon-trash" />,
  Printer:      () => <span data-testid="icon-printer" />,
  Gauge:        () => <span data-testid="icon-gauge" />,
  ChevronLeft:  () => <span />,
  ChevronRight: () => <span />,
}));

vi.mock('../../../supabase', () => ({
  supabase: { from: mockSupabaseFrom },
}));

vi.mock('../../../components/ToastProvider', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError:   mockShowError,
    showInfo:    mockShowInfo,
  }),
}));

vi.mock('../../../components/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button data-testid="btn-confirm" onClick={onConfirm}>Confirmar</button>
        <button data-testid="btn-cancel"  onClick={onCancel}>Cancelar</button>
      </div>
    ) : null,
}));

// VehicleHeader: expone estado vía spans de display para lectura directa
vi.mock('../VehicleHeader', () => ({
  VehicleHeader: ({
    searchId, setSearchId, handleSearchClient,
    dateFrom, setDateFrom, dateTo, setDateTo,
    onClearSearch,
  }: any) => (
    <div data-testid="vehicle-header">
      <input
        data-testid="search-id-input"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />
      <button data-testid="btn-search" onClick={handleSearchClient}>Buscar</button>
      <input
        data-testid="date-from-input"
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />
      <input
        data-testid="date-to-input"
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
      />
      <button data-testid="btn-clear" onClick={onClearSearch}>Limpiar</button>
      {/* Spans de visualización explícitos para leer el estado de React en tests */}
      <span data-testid="display-date-from">{dateFrom}</span>
      <span data-testid="display-date-to">{dateTo}</span>
    </div>
  ),
}));

vi.mock('../VehicleList', () => ({
  VehicleList: ({ records, onSelectPlate }: any) => (
    <div data-testid="vehicle-list">
      {records.map((r: any) => (
        <button
          key={r.id}
          data-testid={`plate-${r.vehiclePlate}`}
          onClick={() => onSelectPlate(r.vehiclePlate)}
        >
          {r.vehiclePlate}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../MaintenanceModule', () => ({
  MaintenanceModule: ({ module }: any) => (
    <div data-testid={`maintenance-module-${module.id}`}>
      <span>{module.mechanic}</span>
    </div>
  ),
}));

vi.mock('../PhotoGalleryModal', () => ({
  PhotoGalleryModal: () => <div data-testid="photo-gallery-modal" />,
}));

vi.mock('../ServiceOrderFormat', () => ({
  ServiceOrderFormat: () => <div data-testid="service-order-format" />,
}));

vi.mock('../../../hooks/queries/useMaintenanceQuery', () => ({
  useMaintenanceRecords:    mockUseMaintenanceRecords,
  useCreateVehicle:         vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({ vehiclePlate: 'TEST01' }), isPending: false }),
  useAddHistoryModule:      vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useUpdateHistory:         vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateSingleModule:    vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveSingleModule:    vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteMaintenanceRecord: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../../../hooks/queries/useInventoryQuery', () => ({
  useInventory: vi.fn().mockReturnValue({ data: { data: [], count: 0 }, isLoading: false }),
}));

// useSearchPagination NO se mockea → usa el hook real.
// El hook real usa useState, así los tests de búsqueda pueden actualizar searchId.

// ─── Factories ────────────────────────────────────────────────────────────────
const buildQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: 0 } },
});

const mockContextBase: any = {
  tenant:  { id: 'tenant-test-001', name: 'Taller Test' },
  user:    { id: 'user-1', email: 'test@test.com' },
  staff:   { nombre: 'Carlos Mecánico', rol: 'admin' },
  hasActionPermission: () => true,
};

const renderWithProviders = (contextOverride?: Partial<typeof mockContextBase>) => {
  const qc  = buildQueryClient();
  const ctx = { ...mockContextBase, ...contextOverride };
  return render(
    <QueryClientProvider client={qc}>
      <WorkshopContext.Provider value={ctx}>
        <MaintenanceTab />
      </WorkshopContext.Provider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  // Restaurar implementaciones tras clearAllMocks
  mockSupabaseFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  });
  mockUseMaintenanceRecords.mockReturnValue({
    data: { data: [], count: 0 },
    isLoading: false,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITES
// ═════════════════════════════════════════════════════════════════════════════

describe('MaintenanceTab — Estado Inicial', () => {
  it('renderiza el VehicleHeader', () => {
    renderWithProviders();
    expect(screen.getByTestId('vehicle-header')).toBeDefined();
  });

  it('renderiza el VehicleList', () => {
    renderWithProviders();
    expect(screen.getByTestId('vehicle-list')).toBeDefined();
  });

  it('muestra "VISTA DIARIA DE TALLER" sin cliente ni placa seleccionada', () => {
    renderWithProviders();
    expect(screen.getByText(/VISTA DIARIA DE TALLER/i)).toBeDefined();
  });

  it('muestra "Cero registros en este periodo" cuando la query retorna vacío', () => {
    renderWithProviders();
    expect(screen.getByText(/Cero registros en este periodo/i)).toBeDefined();
  });

  it('NO muestra el botón "Nuevo Servicio" sin placa seleccionada', () => {
    renderWithProviders();
    expect(screen.queryByText(/Nuevo Servicio/i)).toBeNull();
  });
});

describe('MaintenanceTab — Filtros de Fecha', () => {
  // Usamos format() igual que el componente para evitar diferencias de timezone
  const today = format(new Date(), 'yyyy-MM-dd');

  it('inicializa dateFrom con la fecha actual (formato yyyy-MM-dd)', () => {
    renderWithProviders();
    expect(screen.getByTestId('display-date-from').textContent).toBe(today);
  });

  it('inicializa dateTo con la fecha actual (formato yyyy-MM-dd)', () => {
    renderWithProviders();
    expect(screen.getByTestId('display-date-to').textContent).toBe(today);
  });

  it('cambiar dateFrom actualiza el display correspondiente', async () => {
    renderWithProviders();
    fireEvent.change(screen.getByTestId('date-from-input'), { target: { value: '2026-01-01' } });
    await waitFor(() => {
      expect(screen.getByTestId('display-date-from').textContent).toBe('2026-01-01');
    });
  });

  it('cambiar dateTo actualiza el display correspondiente', async () => {
    renderWithProviders();
    fireEvent.change(screen.getByTestId('date-to-input'), { target: { value: '2026-12-31' } });
    await waitFor(() => {
      expect(screen.getByTestId('display-date-to').textContent).toBe('2026-12-31');
    });
  });

  it('"Limpiar" restaura dateFrom al día actual', async () => {
    renderWithProviders();
    fireEvent.change(screen.getByTestId('date-from-input'), { target: { value: '2026-01-01' } });
    await waitFor(() =>
      expect(screen.getByTestId('display-date-from').textContent).toBe('2026-01-01')
    );
    fireEvent.click(screen.getByTestId('btn-clear'));
    await waitFor(() => {
      expect(screen.getByTestId('display-date-from').textContent).toBe(today);
    });
  });

  it('"Limpiar" restaura dateTo al día actual', async () => {
    renderWithProviders();
    fireEvent.change(screen.getByTestId('date-to-input'), { target: { value: '2025-01-01' } });
    await waitFor(() =>
      expect(screen.getByTestId('display-date-to').textContent).toBe('2025-01-01')
    );
    fireEvent.click(screen.getByTestId('btn-clear'));
    await waitFor(() => {
      expect(screen.getByTestId('display-date-to').textContent).toBe(today);
    });
  });

  it('useMaintenanceRecords recibe las fechas de hoy en el primer render', () => {
    renderWithProviders();
    expect(mockUseMaintenanceRecords).toHaveBeenCalledWith(
      'tenant-test-001',
      today,
      today,
      expect.any(Number),
      expect.any(Number),
      undefined,
    );
  });
});

describe('MaintenanceTab — Búsqueda de Cliente', () => {
  it('el input de búsqueda está presente', () => {
    renderWithProviders();
    expect(screen.getByTestId('search-id-input')).toBeDefined();
  });

  it('tipear en el input actualiza el valor visible', async () => {
    renderWithProviders();
    const input = screen.getByTestId('search-id-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12345' } });
    await waitFor(() => expect(input.value).toBe('12345'));
  });

  it('buscar con ID sin resultados llama showInfo("No Encontrado")', async () => {
    // supabase retorna null por defecto (configurado en beforeEach)
    renderWithProviders();
    const input = screen.getByTestId('search-id-input');
    fireEvent.change(input, { target: { value: '999999' } });
    // El hook real actualizó el estado → searchId = '999999'
    fireEvent.click(screen.getByTestId('btn-search'));

    await waitFor(() => {
      expect(mockShowInfo).toHaveBeenCalledWith(
        'No Encontrado',
        expect.stringContaining('ningún cliente'),
      );
    });
  });

  it('buscar con ID válido llama showSuccess("Cliente Encontrado")', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      in:     vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'c-001', tenant_id: 'tenant-test-001',
          name: 'Juan Pérez', phone: '3001234567',
          email: 'juan@test.com', address: 'Calle 1',
          id_type: 'CC', id_number: '123456789', discount: 0,
        },
        error: null,
      }),
    });

    renderWithProviders();
    fireEvent.change(screen.getByTestId('search-id-input'), { target: { value: '123456789' } });
    fireEvent.click(screen.getByTestId('btn-search'));

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Cliente Encontrado',
        expect.stringContaining('Juan Pérez'),
      );
    });
  });
});

describe('MaintenanceTab — Modal de Nuevo Vehículo', () => {
  it('NO está visible por defecto', () => {
    renderWithProviders();
    expect(screen.queryByText(/Nuevo Ingreso/i)).toBeNull();
  });
});

describe('MaintenanceTab — ConfirmModal de Eliminación', () => {
  it('NO está visible por defecto', () => {
    renderWithProviders();
    expect(screen.queryByTestId('confirm-modal')).toBeNull();
  });
});

describe('MaintenanceTab — Paginación', () => {
  it('NO muestra botones de paginación cuando count = 0', () => {
    renderWithProviders();
    expect(screen.queryByText(/Anterior/i)).toBeNull();
    expect(screen.queryByText(/Siguiente/i)).toBeNull();
  });
});

describe('MaintenanceTab — Sin Tenant', () => {
  it('no lanza excepciones si tenant es null', () => {
    expect(() => renderWithProviders({ tenant: null })).not.toThrow();
  });
});
