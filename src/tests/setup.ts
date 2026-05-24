import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Limpiar todos los mocks después de cada test para evitar contaminación entre pruebas
afterEach(() => {
  vi.clearAllMocks();
});
