import { useState } from 'react';
import { useDebounce } from '../utils';

/**
 * Hook universal para centralizar la logica de paginacion, barras de busqueda y delay anti-spam (debounce).
 *
 * @param initialPageSize - Default a 50
 * @param debounceDelay - Milisegundos de espera para despachar el evento de busqueda
 */
export function useSearchPagination(initialPageSize = 50, debounceDelay = 500) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, debounceDelay);
  const [page, setPage] = useState(0);

  // Cada vez que el usuario escribe, devolvemos la pagina a 0 automaticamente
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return {
    search,
    setSearch: handleSearchChange, // Reemplaza setSearch nativo para ligar reset de pagina
    debouncedSearch,
    page,
    setPage,
    pageSize: initialPageSize
  };
}
