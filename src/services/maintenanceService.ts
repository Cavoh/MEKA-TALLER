import { supabase } from '../supabase';
import { MaintenanceRecord, MaintenanceHistory, InventoryItem } from '../types';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export const maintenanceService = {
  /**
   * Consulta unificada: siempre filtra por rango de fechas y opcionalmente por cliente.
   * Esto garantiza que el historial de un cliente respete el filtro de fecha activo en la UI.
   */
  async getRecords(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
    page: number = 0,
    pageSize: number = 50,
    clientId?: string
  ): Promise<{ data: MaintenanceRecord[], count: number }> {
    const rangeFrom = page * pageSize;
    const rangeTo = rangeFrom + pageSize - 1;

    // Offset explícito de Colombia (-05:00)
    const start = `${dateFrom}T00:00:00.000-05:00`;
    const end   = `${dateTo}T23:59:59.999-05:00`;

    let query = supabase
      .from('meka_maintenance')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
      .range(rangeFrom, rangeTo);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const mapRecord = (record: any): MaintenanceRecord => ({
      id: record.id,
      tenantId: record.tenant_id,
      clientId: record.client_id,
      vehiclePlate: record.vehicle_plate,
      status: record.status,
      history: (Array.isArray(record.history)
        ? record.history
        : (typeof record.history === 'string' ? JSON.parse(record.history) : record.history)
      ) || []
    });

    return { data: (data || []).map(mapRecord), count: count || 0 };
  },

  async createVehicle(tenantId: string, clientId: string, plate: string, mechanicName: string | null): Promise<MaintenanceRecord> {
    const newModule: MaintenanceHistory = {
      id: `hist_${Date.now()}`,
      date: new Date().toISOString(),
      mechanic: mechanicName || '',
      notes: '',
      photos: [],
      items: [{ description: '', quantity: 1, price: 0, total: 0 }],
      status: 'open'
    };

    const { data, error } = await supabase
      .from('meka_maintenance')
      .insert({
        tenant_id: tenantId,
        client_id: clientId,
        vehicle_plate: plate.toUpperCase(),
        status: 'open',
        mecanico: mechanicName,
        history: [newModule]
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      clientId: data.client_id,
      vehiclePlate: data.vehicle_plate,
      status: data.status,
      history: [newModule]
    };
  },

  async addHistoryModule(tenantId: string, clientId: string, vehiclePlate: string, mechanicName: string): Promise<MaintenanceRecord> {
    const newModule: MaintenanceHistory = {
      id: `hist_${Date.now()}`,
      date: new Date().toISOString(),
      mechanic: mechanicName,
      notes: '',
      photos: [],
      items: [{ description: '', quantity: 1, price: 0, total: 0 }],
      status: 'open'
    };

    const { data, error } = await supabase
      .from('meka_maintenance')
      .insert({
        tenant_id: tenantId,
        client_id: clientId,
        vehicle_plate: vehiclePlate,
        status: 'open',
        mecanico: mechanicName,
        history: [newModule]
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      clientId: data.client_id,
      vehiclePlate: data.vehicle_plate,
      status: data.status,
      history: (Array.isArray(data.history) ? data.history : (typeof data.history === 'string' ? JSON.parse(data.history) : data.history)) || []
    };
  },

  async updateSingleModule(recordId: string, moduleId: string, updatedData: Partial<MaintenanceHistory>): Promise<void> {
    // 1. Fetch fresh list from Supabase
    const { data: dbRecord, error: fetchError } = await supabase
      .from('meka_maintenance')
      .select('history')
      .eq('id', recordId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!dbRecord) throw new Error('Registro principal no encontrado.');

    // 2. Safely parse and find the module
    const rawHistory = Array.isArray(dbRecord.history) ? dbRecord.history : (typeof dbRecord.history === 'string' ? JSON.parse(dbRecord.history) : dbRecord.history);
    const dbHistory: MaintenanceHistory[] = rawHistory || [];
    
    const existingModuleIndex = dbHistory.findIndex(m => m.id === moduleId);
    
    if (existingModuleIndex === -1) {
      throw new Error('OTRO_MECANICO_BORRO_ESTE_MODULO');
    }

    // 3. Merge data locally
    dbHistory[existingModuleIndex] = { ...dbHistory[existingModuleIndex], ...updatedData };

    // 4. Update the merged array back immediately
    const { error: updateError } = await supabase
      .from('meka_maintenance')
      .update({ history: dbHistory })
      .eq('id', recordId);
      
    if (updateError) throw updateError;
  },

  async removeSingleModule(recordId: string, moduleId: string): Promise<void> {
    const { data: dbRecord, error: fetchError } = await supabase
      .from('meka_maintenance')
      .select('history')
      .eq('id', recordId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!dbRecord) return;

    const rawHistory = Array.isArray(dbRecord.history) ? dbRecord.history : (typeof dbRecord.history === 'string' ? JSON.parse(dbRecord.history) : dbRecord.history);
    const dbHistory: MaintenanceHistory[] = rawHistory || [];
    
    const newHistory = dbHistory.filter(m => m.id !== moduleId);

    if (newHistory.length === 0) {
      // If no modules left, delete the entire record
      const { error: delError } = await supabase.from('meka_maintenance').delete().eq('id', recordId);
      if (delError) throw delError;
    } else {
      const { error: updateError } = await supabase.from('meka_maintenance').update({ history: newHistory }).eq('id', recordId);
      if (updateError) throw updateError;
    }
  },

  async updateHistory(recordId: string, history: MaintenanceHistory[]): Promise<void> {
    const { error } = await supabase
      .from('meka_maintenance')
      .update({ history })
      .eq('id', recordId);
    if (error) throw error;
  },

  async deleteRecord(recordId: string): Promise<void> {
    const { error } = await supabase
      .from('meka_maintenance')
      .delete()
      .eq('id', recordId);
    if (error) throw error;
  },

  async uploadPhoto(tenantId: string, recordId: string, file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('meka-photos')
      .upload(`maintenance_photos/${tenantId}/${recordId}/${fileName}`, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('meka-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  }
};
