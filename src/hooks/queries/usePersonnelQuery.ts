import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../supabase';
import { Personal } from '../../types';

export function usePersonnel(tenantId: string) {
  return useQuery({
    queryKey: ['personnel', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meka_personal')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Personal[];
    },
    enabled: !!tenantId,
  });
}
