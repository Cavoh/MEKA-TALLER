import { supabase } from '../supabase';
import { InventoryItem } from '../types';

/** Mapea una fila raw de Supabase al tipo InventoryItem tipado */
const mapInventoryItem = (item: any): InventoryItem => ({
  id: item.id,
  tenantId: item.tenant_id,
  sku: item.sku,
  name: item.name,
  category: item.category,
  stock: item.stock,
  price: Number(item.price),
  description: item.description,
  supplier: item.supplier,
  iva: item.iva || 0,
  stock_minimo: item.stock_minimo || 0
});

export const inventoryService = {
  async searchInventory(tenantId: string, query: string, page: number = 0, pageSize: number = 50): Promise<{ data: InventoryItem[], count: number }> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from('meka_inventory')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true })
      .range(from, to);

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Error searching inventory:', error);
      throw error;
    }

    return { data: (data || []).map(mapInventoryItem), count: count || 0 };
  },

  async saveItem(tenantId: string, itemData: any, itemId?: string): Promise<void> {
    const data = {
      tenant_id: tenantId,
      name: itemData.name,
      category: itemData.category,
      stock: itemData.stock,
      price: itemData.price,
      description: itemData.description,
      sku: itemData.sku,
      supplier: itemData.supplier,
      iva: itemData.iva,
      stock_minimo: itemData.stock_minimo
    };

    if (itemId) {
      const { error } = await supabase
        .from('meka_inventory')
        .update(data)
        .eq('id', itemId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('meka_inventory')
        .insert(data);
      if (error) throw error;
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('meka_inventory')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  async recordMovement(params: {
    tenantId: string;
    itemId: string;
    sku: string;
    amount: number;
    type: string;
    description: string;
    // NOTE: currentStock is intentionally removed.
    // The atomic RPC function handles the calculation server-side,
    // preventing read-modify-write race conditions between concurrent users.
  }): Promise<number> {
    const { tenantId, itemId, sku, amount, type, description } = params;

    const { data: newStock, error } = await supabase.rpc('meka_adjust_stock', {
      p_item_id: itemId,
      p_tenant_id: tenantId,
      p_amount: amount,
      p_sku: sku,
      p_type: type,
      p_description: description
    });

    if (error) {
      if (error.message?.includes('STOCK_INSUFICIENTE')) {
        throw new Error('Stock insuficiente para realizar el movimiento de salida.');
      }
      throw error;
    }

    return newStock as number;
  },

  async getCategories(tenantId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('meka_inventory')
      .select('category')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    const categories = Array.from(new Set((data || []).map(item => item.category).filter(Boolean)));
    return categories.sort();
  },

  async getProductsByCategory(tenantId: string, category: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('meka_inventory')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapInventoryItem);
  }
};
