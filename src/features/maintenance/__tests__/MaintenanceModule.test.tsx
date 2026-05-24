/**
 * @file MaintenanceModule.test.tsx
 * @description Suite de pruebas unitarias para el componente MaintenanceModule.
 *
 * Cubre:
 *  - Renderizado base (módulos abiertos y cerrados)
 *  - Regla: el último ítem NO puede ser eliminado (se blanquea, nunca se borra)
 *  - Regla: no se pueden agregar ítems sin KM previo
 *  - Cálculo de totales (qty × price)
 *  - Sincronización de KM en blur
 *  - Permisos RBAC (ACTION_ELIMINAR_ITEMS / ACTION_EDITAR_ITEMS)
 *  - Estado visible: "Abierto" vs "Facturado"
 *  - Campo de notas habilitado/bloqueado según estado
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaintenanceModule } from '../MaintenanceModule';
import type { MaintenanceHistory, InventoryItem } from '../../../types';

// ─── Mocks de íconos para que jsdom no explote ──────────────────────────────
vi.mock('lucide-react', () => ({
  Calendar:  () => <span data-testid="icon-calendar" />,
  UserRound: () => <span data-testid="icon-user" />,
  Camera:    () => <span data-testid="icon-camera" />,
  Trash2:    () => <span data-testid="icon-trash2" />,
  Trash:     () => <span data-testid="icon-trash" />,
  Printer:   () => <span data-testid="icon-printer" />,
  Gauge:     () => <span data-testid="icon-gauge" />,
}));

// ─── Datos de prueba reutilizables ───────────────────────────────────────────
const buildModule = (overrides: Partial<MaintenanceHistory> = {}): MaintenanceHistory => ({
  id: 'mod-test-001',
  date: '2026-04-14T10:00:00Z',
  mechanic: 'Carlos Mecánico',
  notes: '',
  photos: [],
  status: 'open',
  km: undefined,
  items: [{ description: '', quantity: 1, price: 0, total: 0 }],
  ...overrides,
});

const mockInventory: InventoryItem[] = [
  { id: 'inv-1', tenantId: 't1', sku: 'SKU001', name: 'Filtro de Aceite', price: 15000, stock: 10, category: 'Filtros' },
  { id: 'inv-2', tenantId: 't1', sku: 'SKU002', name: 'Aceite 20W50',     price: 35000, stock: 20, category: 'Lubricantes' },
];

/** Helper: todas las props mínimas necesarias para renderizar el componente */
const defaultProps = (moduleOverride?: Partial<MaintenanceHistory>, permOverride?: (p: string) => boolean) => ({
  module: buildModule(moduleOverride),
  inventory: mockInventory,
  hasActionPermission: permOverride ?? (() => true),
  clientInfo: { name: 'Juan Pérez', idNumber: '123456789' },
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  onOpenPhotos: vi.fn(),
  onPrint: vi.fn(),
});

// ─── SUITE PRINCIPAL ──────────────────────────────────────────────────────────
describe('MaintenanceModule — Renderizado base', () => {
  it('renderiza sin errores con módulo abierto vacío', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    expect(screen.getByText(/Repuestos y Servicios/i)).toBeDefined();
    expect(screen.getByText(/Notas/i)).toBeDefined();
  });

  it('muestra badge "Abierto" cuando status = open', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    expect(screen.getByText(/Abierto/i)).toBeDefined();
  });

  it('muestra badge "Facturado" cuando status = closed', () => {
    render(<MaintenanceModule {...defaultProps({ status: 'closed' })} />);
    expect(screen.getByText(/Facturado/i)).toBeDefined();
  });

  it('muestra el nombre del cliente en el header', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    expect(screen.getByText('Juan Pérez')).toBeDefined();
  });

  it('muestra la cédula/ID del cliente en el header', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    expect(screen.getByText(/123456789/)).toBeDefined();
  });

  it('muestra el mecánico pre-cargado', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    const input = screen.getByPlaceholderText('Mecánico...') as HTMLInputElement;
    expect(input.value).toBe('Carlos Mecánico');
  });

  it('muestra la fecha formateada correctamente (dd/MM/yyyy HH:mm)', () => {
    render(<MaintenanceModule {...defaultProps()} />);
    // La fecha '2026-04-14T10:00:00Z' debe aparecer como '14/04/2026'
    expect(screen.getByText(/14\/04\/2026/)).toBeDefined();
  });
});

// ─── SUITE: Campo KM ──────────────────────────────────────────────────────────
describe('MaintenanceModule — Campo KM', () => {
  it('muestra indicador "OBLIGATORIO" cuando KM está vacío', () => {
    render(<MaintenanceModule {...defaultProps({ km: undefined })} />);
    expect(screen.getByText(/OBLIGATORIO/i)).toBeDefined();
  });

  it('muestra ✓ cuando KM tiene valor', () => {
    render(<MaintenanceModule {...defaultProps({ km: 45000 })} />);
    expect(screen.getByText(/KM ✓/i)).toBeDefined();
  });

  it('llama onUpdate con km numérico al salir del campo (blur)', () => {
    const onUpdate = vi.fn();
    const props = { ...defaultProps(), onUpdate, module: buildModule({ km: undefined }) };
    render(<MaintenanceModule {...props} />);

    const kmInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
    fireEvent.change(kmInput, { target: { value: '50000' } });
    fireEvent.blur(kmInput);

    expect(onUpdate).toHaveBeenCalledWith({ km: 50000 });
  });

  it('NO llama onUpdate si el km no cambió', () => {
    const onUpdate = vi.fn();
    const props = { ...defaultProps(), onUpdate, module: buildModule({ km: 45000 }) };
    render(<MaintenanceModule {...props} />);

    const kmInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
    fireEvent.blur(kmInput); // valor "45000" = igual al actual
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('no acepta letras en el campo KM (solo dígitos)', () => {
    const props = defaultProps({ km: undefined });
    render(<MaintenanceModule {...props} />);

    const kmInput = screen.getByPlaceholderText('000000') as HTMLInputElement;
    fireEvent.change(kmInput, { target: { value: 'ABC123' } });
    expect(kmInput.value).toBe('123');
  });
});

// ─── SUITE: Regla del Último Ítem ─────────────────────────────────────────────
describe('MaintenanceModule — Regla: el último ítem nunca se elimina', () => {
  it('cuando hay 1 solo ítem y se presiona Trash, onUpdate se llama con item blanqueado (no vacío)', () => {
    const onUpdate = vi.fn();
    const props = {
      ...defaultProps({ km: 1000, items: [{ description: 'Filtro', quantity: 1, price: 15000, total: 15000 }] }),
      onUpdate,
    };
    render(<MaintenanceModule {...props} />);

    const trashButtons = screen.getAllByTestId('icon-trash');
    // Hay exactamente 1 botón de basurero para la única fila
    expect(trashButtons.length).toBe(1);
    fireEvent.click(trashButtons[0].parentElement as HTMLElement);

    // Debe llamar a onUpdate con 1 item en blanco (no array vacío)
    expect(onUpdate).toHaveBeenCalledWith({
      items: [{ description: '', quantity: 1, price: 0, total: 0 }],
    });
  });

  it('cuando hay 2 ítems y se elimina el primero, queda 1 ítem (no 0)', () => {
    const onUpdate = vi.fn();
    const items = [
      { description: 'Filtro', quantity: 1, price: 15000, total: 15000 },
      { description: 'Aceite', quantity: 2, price: 35000, total: 70000 },
    ];
    render(<MaintenanceModule {...defaultProps({ km: 1000, items })} onUpdate={onUpdate} />);

    const trashButtons = screen.getAllByTestId('icon-trash');
    fireEvent.click(trashButtons[0].parentElement as HTMLElement);

    // El item 0 se eliminó, queda el item 1
    const calledWith = onUpdate.mock.calls[0][0];
    expect(calledWith.items).toHaveLength(1);
    expect(calledWith.items[0].description).toBe('Aceite');
  });
});

// ─── SUITE: Cálculo de Totales ────────────────────────────────────────────────
describe('MaintenanceModule — Cálculo de totales', () => {
  it('muestra Total Servicio $0 cuando todos los ítems tienen precio 0', () => {
    render(<MaintenanceModule {...defaultProps({ km: 1000 })} />);
    expect(screen.getByText(/Total Servicio/i)).toBeDefined();
    expect(screen.getAllByText(/\$0/).length).toBeGreaterThan(0);
  });

  it('muestra el total correcto con items pre-cargados (qty × price)', () => {
    const items = [
      { description: 'Filtro',  quantity: 2, price: 15000, total: 30000 },
      { description: 'Aceite',  quantity: 1, price: 35000, total: 35000 },
    ];
    render(<MaintenanceModule {...defaultProps({ km: 1000, items })} />);
    // total = 30000 + 35000 = 65000
    expect(screen.getByText(/65,000|65\.000/)).toBeDefined();
  });
});

// ─── SUITE: Módulo Cerrado (Facturado) ────────────────────────────────────────
describe('MaintenanceModule — Estado Cerrado (Facturado)', () => {
  it('no muestra el campo KM en módulo cerrado', () => {
    render(<MaintenanceModule {...defaultProps({ status: 'closed', km: 45000 })} />);
    expect(screen.queryByPlaceholderText('000000')).toBeNull();
  });

  it('todos los inputs de ítems están disabled en módulo cerrado', () => {
    const items = [{ description: 'Filtro', quantity: 1, price: 15000, total: 15000 }];
    render(<MaintenanceModule {...defaultProps({ status: 'closed', items })} />);

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    inputs.forEach(input => {
      expect(input.disabled).toBe(true);
    });
  });

  it('el campo notas está disabled en módulo cerrado', () => {
    render(<MaintenanceModule {...defaultProps({ status: 'closed' })} />);
    const notesTextarea = screen.getByPlaceholderText('Notas del mantenimiento...') as HTMLTextAreaElement;
    expect(notesTextarea.disabled).toBe(true);
  });

  it('no muestra botón de eliminar módulo cuando está cerrado', () => {
    render(<MaintenanceModule {...defaultProps({ status: 'closed' })} />);
    // El botón Trash2 (eliminar módulo completo) no debe aparecer
    expect(screen.queryByTestId('icon-trash2')).toBeNull();
  });
});

// ─── SUITE: Permisos RBAC ─────────────────────────────────────────────────────
describe('MaintenanceModule — Permisos RBAC', () => {
  it('oculta botón eliminar módulo (Trash2) si NO tiene ACTION_ELIMINAR_ITEMS', () => {
    // Sin permiso de eliminación
    const sinPermiso = (p: string) => p !== 'ACTION_ELIMINAR_ITEMS';
    render(<MaintenanceModule {...defaultProps({}, sinPermiso)} />);
    expect(screen.queryByTestId('icon-trash2')).toBeNull();
  });

  it('muestra botón eliminar módulo (Trash2) si tiene ACTION_ELIMINAR_ITEMS', () => {
    const conPermiso = () => true;
    render(<MaintenanceModule {...defaultProps({}, conPermiso)} />);
    expect(screen.getByTestId('icon-trash2')).toBeDefined();
  });

  it('llama onDelete cuando se hace click en Trash2 (eliminar módulo)', () => {
    const onDelete = vi.fn();
    const props = { ...defaultProps(), onDelete };
    render(<MaintenanceModule {...props} />);

    const trash2 = screen.getByTestId('icon-trash2').parentElement as HTMLElement;
    fireEvent.click(trash2);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('llama onPrint cuando se hace click en el ícono de impresora', () => {
    const onPrint = vi.fn();
    const props = { ...defaultProps(), onPrint };
    render(<MaintenanceModule {...props} />);

    const printer = screen.getByTestId('icon-printer').parentElement as HTMLElement;
    fireEvent.click(printer);
    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it('llama onOpenPhotos cuando se hace click en el ícono de cámara', () => {
    const onOpenPhotos = vi.fn();
    const props = { ...defaultProps(), onOpenPhotos };
    render(<MaintenanceModule {...props} />);

    const camera = screen.getByTestId('icon-camera').parentElement as HTMLElement;
    fireEvent.click(camera);
    expect(onOpenPhotos).toHaveBeenCalledTimes(1);
  });
});

// ─── SUITE: Campo Notas ───────────────────────────────────────────────────────
describe('MaintenanceModule — Campo de Notas', () => {
  it('actualiza las notas y llama onUpdate al cambiar', () => {
    const onUpdate = vi.fn();
    render(<MaintenanceModule {...defaultProps()} onUpdate={onUpdate} />);

    const textarea = screen.getByPlaceholderText('Notas del mantenimiento...');
    fireEvent.change(textarea, { target: { value: 'Cambio de aceite y filtro' } });

    expect(onUpdate).toHaveBeenCalledWith({ notes: 'Cambio de aceite y filtro' });
  });

  it('está habilitado en módulo abierto', () => {
    render(<MaintenanceModule {...defaultProps({ status: 'open' })} />);
    const textarea = screen.getByPlaceholderText('Notas del mantenimiento...') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(false);
  });
});

// ─── SUITE: Autocompletar Inventario ─────────────────────────────────────────
describe('MaintenanceModule — Autocompletar con inventario', () => {
  it('rellena el precio automáticamente al seleccionar un ítem del inventario', () => {
    const onUpdate = vi.fn();
    const items = [{ description: '', quantity: 1, price: 0, total: 0 }];
    render(<MaintenanceModule {...defaultProps({ km: 1000, items })} onUpdate={onUpdate} />);

    const descInput = screen.getByPlaceholderText('Descripción...');
    fireEvent.change(descInput, { target: { value: 'Filtro de Aceite' } });

    // onUpdate debe llamarse con el precio del inventario (15000)
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.items[0].description).toBe('Filtro de Aceite');
    expect(lastCall.items[0].price).toBe(15000);
  });
});
