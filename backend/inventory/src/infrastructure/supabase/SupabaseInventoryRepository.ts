import { SupabaseClient } from '@supabase/supabase-js';
import {
  IInventoryRepository,
  Sale,
} from '../../repositories/IInventoryRepository';

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async variantExists(variantId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('variants')
      .select('id')
      .eq('id', variantId)
      .single();

    return !error && !!data;
  }

  async recordSales(variantId: string, quantity: number): Promise<Sale[]> {
    const salesToInsert = Array.from({ length: quantity }, () => ({
      variant_id: variantId,
    }));

    const { data: sales, error } = await this.supabase
      .from('sales')
      .insert(salesToInsert)
      .select();

    if (error) throw error;

    return sales || [];
  }

  async recordSale(variantId: string): Promise<Sale> {
    const { data: sale, error } = await this.supabase
      .from('sales')
      .insert({
        variant_id: variantId,
      })
      .select()
      .single();

    if (error) throw error;

    return sale;
  }

  async getSalesCountPerVariant(): Promise<any[]> {
    const { data: salesCounts, error } = await this.supabase
      .rpc('get_sales_count_per_variant');

    if (error) throw error;

    return salesCounts || [];
  }
}
