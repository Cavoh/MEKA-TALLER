import { supabase } from '../supabase';
import { Client } from '../types';

export const clientService = {
  async searchClients(tenantId: string, query: string, page: number = 0, pageSize: number = 50): Promise<{ data: Client[], count: number }> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from('meka_clients')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true })
      .range(from, to);

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,id_number.ilike.%${query}%`);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Error searching clients:', error);
      throw error;
    }

    const mappedData = (data || []).map(client => ({
      id: client.id,
      tenantId: client.tenant_id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      idType: client.id_type,
      idNumber: client.id_number,
      discount: Number(client.discount)
    }));

    return { data: mappedData, count: count || 0 };
  },

  async saveClient(tenantId: string, clientData: any, clientId?: string): Promise<void> {
    const data = {
      tenant_id: tenantId,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      address: clientData.address,
      id_type: clientData.idType,
      id_number: clientData.idNumber,
      discount: clientData.discount
    };

    if (clientId) {
      const { error } = await supabase
        .from('meka_clients')
        .update(data)
        .eq('id', clientId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('meka_clients')
        .insert(data);
      if (error) throw error;
    }
  },

  async deleteClient(clientId: string): Promise<void> {
    const { error } = await supabase
      .from('meka_clients')
      .delete()
      .eq('id', clientId);
    if (error) throw error;
  }
};
