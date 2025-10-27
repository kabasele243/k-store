import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../../libs/errorHandler';
import {
  IVariantRepository,
  Variant,
  CreateVariantData,
  UpdateVariantData,
} from '../../repositories/IVariantRepository';

export class SupabaseVariantRepository implements IVariantRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateVariantData): Promise<Variant> {
    const { data: variant, error } = await this.supabase
      .from('variants')
      .insert({
        product_id: data.product_id,
        sku: data.sku,
        attributes: data.attributes || {},
        price: data.price,
      })
      .select()
      .single();

    if (error) throw error;

    return variant;
  }

  async findByIdWithInventory(variantId: string): Promise<Variant | null> {
    const { data: variant, error } = await this.supabase
      .from('variants')
      .select(`
        *,
        inventory_items (*)
      `)
      .eq('id', variantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return variant;
  }

  async update(variantId: string, data: UpdateVariantData): Promise<void> {
    const updateData: any = {};
    if (data.price !== undefined) updateData.price = data.price;
    if (data.sku) updateData.sku = data.sku;
    if (data.attributes) updateData.attributes = data.attributes;

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase
        .from('variants')
        .update(updateData)
        .eq('id', variantId);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError(404, 'Variant not found');
        }
        throw error;
      }
    }
  }

  async updateInventoryQuantity(
    variantId: string,
    inventoryId: string,
    quantity: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', inventoryId)
      .eq('variant_id', variantId);

    if (error) throw error;
  }

  async productExists(productId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    return !error && !!data;
  }
}
