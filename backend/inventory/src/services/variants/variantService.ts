import { getSupabaseClient } from '../../libs/supabaseClient';
import { ApiError } from '../../libs/errorHandler';

export interface CreateVariantRequest {
  product_id: string;
  sku: string;
  attributes?: Record<string, any>;
  price?: number;
}

export interface UpdateVariantRequest {
  price?: number;
  sku?: string;
  attributes?: Record<string, any>;
  inventory_id?: string;
  quantity?: number;
}

export const createVariant = async (request: CreateVariantRequest) => {
  // Validate required fields
  if (!request.product_id) {
    throw new ApiError(400, 'Product ID is required');
  }
  if (!request.sku) {
    throw new ApiError(400, 'SKU is required');
  }

  const supabase = getSupabaseClient();

  // Verify product exists
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('id', request.product_id)
    .single();

  if (productError || !product) {
    throw new ApiError(404, 'Product not found');
  }

  // Create the variant
  const { data: variant, error } = await supabase
    .from('variants')
    .insert({
      product_id: request.product_id,
      sku: request.sku,
      attributes: request.attributes || {},
      price: request.price,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { variant };
};

export const updateVariant = async (
  variantId: string,
  request: UpdateVariantRequest
) => {
  if (!variantId) {
    throw new ApiError(400, 'Variant ID is required');
  }

  const { price, sku, attributes, inventory_id, quantity } = request;

  // At least one field must be provided
  if (price === undefined && !sku && !attributes && (inventory_id === undefined || quantity === undefined)) {
    throw new ApiError(400, 'At least one field to update is required');
  }

  const supabase = getSupabaseClient();

  // Build update object for variant
  const updateData: any = {};
  if (price !== undefined) updateData.price = price;
  if (sku) updateData.sku = sku;
  if (attributes) updateData.attributes = attributes;

  // Update the variant if any variant fields provided
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
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

  // Update inventory quantity if provided
  if (inventory_id && quantity !== undefined) {
    const { error: inventoryError } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', inventory_id)
      .eq('variant_id', variantId);

    if (inventoryError) {
      throw inventoryError;
    }
  }

  // Fetch the updated variant with inventory
  const { data: variant, error: fetchError } = await supabase
    .from('variants')
    .select(`
      *,
      inventory_items (*)
    `)
    .eq('id', variantId)
    .single();

  if (fetchError) throw fetchError;

  return { variant };
};
