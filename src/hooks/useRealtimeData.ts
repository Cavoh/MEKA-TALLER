import { useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * Hook reutilizable que encapsula la suscripción a cambios en tiempo real de Supabase.
 * Elimina la duplicación del patrón channel/subscribe/removeChannel en todos los módulos.
 *
 * @param table - Nombre de la tabla de Supabase a escuchar
 * @param tenantId - ID del taller (tenant) para filtrar eventos por tenant
 * @param callback - Función a ejecutar cuando haya cambios en la tabla
 * @param channelSuffix - Sufijo opcional para hacer el nombre del canal único
 */
export function useRealtimeData(
  table: string,
  tenantId: string | undefined | null,
  callback: () => void,
  channelSuffix?: string
): void {
  useEffect(() => {
    if (!tenantId) return;

    const channelName = `${table}_changes_${tenantId}${channelSuffix ? `_${channelSuffix}` : ''}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);
}
