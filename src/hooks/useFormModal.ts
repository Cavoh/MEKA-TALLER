import { useState } from 'react';

/**
 * Hook universal para gestionar el estado de los modales CRUD (Crear/Editar).
 * 
 * @param initialFormData - El estado inicial vacio del formulario
 */
export function useFormModal<TItem, TForm>(initialFormData: TForm) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [formData, setFormData] = useState<TForm>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Abre el modal. Si se provee un item y una funcion de mapeo,
   * el modal se abre en modo "Edición", de lo contrario en modo "Creación".
   */
  const openModal = (item?: TItem | null, mapToForm?: (item: TItem) => TForm) => {
    if (item && mapToForm) {
      setEditingItem(item);
      setFormData(mapToForm(item));
    } else {
      setEditingItem(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  /**
   * Cierra el modal y restablece absolutamente todo el estado del formulario.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    isSaving,
    setIsSaving,
    openModal,
    closeModal
  };
}
