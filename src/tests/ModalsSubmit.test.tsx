import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mocks de lucide-react para evitar renderizados rotos o warnings
vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="save-icon" />,
  X: () => <div data-testid="x-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Package: () => <div data-testid="package-icon" />,
}));

// Importar los modales que vamos a testear
import { ClientFormModal } from '../features/clients/ClientFormModal';
import { InventoryFormModal } from '../features/inventory/InventoryFormModal';
import { StockMovementModal } from '../features/inventory/StockMovementModal';

describe('Modal Submit Linkage Tests - Meka Taller', () => {
  
  describe('ClientFormModal Submit', () => {
    it('debe disparar la función onSubmit al hacer click en el botón GUARDAR del footer', () => {
      const mockOnSubmit = vi.fn((e) => e.preventDefault());
      const mockSetFormData = vi.fn();
      const mockOnClose = vi.fn();
      const mockFormData = {
        name: 'JEAN CLAUDE VAN DAME',
        phone: '3216549874',
        email: 'jean@gmail.com',
        address: 'Calle 52 # 1B - 36',
        idType: 'CC',
        idNumber: '123456789',
        discount: 5
      };

      render(
        <ClientFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          formData={mockFormData}
          setFormData={mockSetFormData}
          isSaving={false}
          editingItem={null}
        />
      );

      // Buscar el botón GUARDAR del footer
      const saveButton = screen.getByRole('button', { name: /guardar/i });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveAttribute('form', 'client-form');

      // Hacer click en el botón y validar que se invoca onSubmit
      fireEvent.click(saveButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('InventoryFormModal Submit', () => {
    it('debe disparar la función onSubmit al hacer click en el botón REGISTRAR PRODUCTO del footer', () => {
      const mockOnSubmit = vi.fn((e) => e.preventDefault());
      const mockSetFormData = vi.fn();
      const mockOnClose = vi.fn();
      const mockFormData = {
        sku: 'ACD-123',
        name: 'Pastillas de Freno',
        description: 'Delanteras',
        category: 'Frenos',
        supplier: 'Proveedor Test',
        price: 150000,
        iva: 19,
        stock_minimo: 5
      };

      render(
        <InventoryFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          formData={mockFormData}
          setFormData={mockSetFormData}
          isSaving={false}
          modalType="add"
          categories={['Frenos']}
          suppliers={[{ id: '1', tenantId: 't1', name: 'Proveedor Test', idType: 'NIT', idNumber: '123-4', phone: '', email: '', address: '', discount: 0, retefuente: 0, reteica: 0 }]}
        />
      );

      // Buscar el botón de registro del footer
      const registerButton = screen.getByRole('button', { name: /registrar producto/i });
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveAttribute('form', 'inventory-form');

      // Hacer click en el botón y validar que se invoca onSubmit
      fireEvent.click(registerButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('StockMovementModal Submit', () => {
    it('debe disparar la función onSubmit al hacer click en el botón CONFIRMAR ENTRADA del footer', () => {
      const mockOnSubmit = vi.fn((e) => e.preventDefault());
      const mockOnClose = vi.fn();
      const mockSetCategory = vi.fn();
      const mockSetSearch = vi.fn();
      const mockSetSuggestions = vi.fn();
      const mockSelectProduct = vi.fn();
      const mockSetAmount = vi.fn();
      const mockItem = {
        id: '1',
        tenantId: 't1',
        name: 'Pastillas de Freno',
        category: 'Frenos',
        stock: 10,
        price: 150000,
        description: 'Delanteras',
        sku: 'ACD-123',
        stock_minimo: 5
      };

      render(
        <StockMovementModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          modalType="entry"
          categories={['Frenos']}
          selectedCategory=""
          setSelectedCategory={mockSetCategory}
          productSearch=""
          setProductSearch={mockSetSearch}
          showProductSuggestions={false}
          setShowProductSuggestions={mockSetSuggestions}
          filteredProducts={[]}
          items={[mockItem]}
          editingItem={mockItem}
          onSelectProduct={mockSelectProduct}
          movementAmount={10}
          setMovementAmount={mockSetAmount}
          isSaving={false}
        />
      );

      // Buscar el botón CONFIRMAR ENTRADA del footer
      const confirmButton = screen.getByRole('button', { name: /confirmar entrada/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveAttribute('form', 'stock-movement-form');

      // Hacer click en el botón y validar que se invoca onSubmit
      fireEvent.click(confirmButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

});
