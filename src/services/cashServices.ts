import { supabase } from '../supabase';
import { ArqueoCaja } from '../types';

export const cashServices = {
  async getCurrentOpenRegister(tenantId: string): Promise<ArqueoCaja | null> {
    const { data, error } = await supabase
      .from('meka_arqueos_caja')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('estado', 'abierta')
      .order('fecha_apertura', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLatestRegister(tenantId: string): Promise<ArqueoCaja | null> {
    const { data, error } = await supabase
      .from('meka_arqueos_caja')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha_apertura', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async openRegister(data: { 
    tenant_id: string; 
    apertura_efectivo: number;
    apertura_tarjeta_debito: number;
    apertura_tarjeta_credito: number;
    apertura_nequi: number;
    apertura_daviplata: number;
    usuario_id: string; 
  }): Promise<ArqueoCaja> {
    const { data: result, error } = await supabase
      .from('meka_arqueos_caja')
      .insert({
        ...data,
        estado: 'abierta',
        fecha_apertura: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async closeRegister(id: number, data: Partial<ArqueoCaja>): Promise<ArqueoCaja> {
    const { data: result, error } = await supabase
      .from('meka_arqueos_caja')
      .update({
        ...data,
        estado: 'cerrada',
        fecha_cierre: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }
};
