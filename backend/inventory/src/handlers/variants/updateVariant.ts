import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const variantId = event.pathParameters?.variantId;

    if (!variantId) {
      throw new ApiError(400, 'Variant ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { price, sku, attributes, inventory_id, quantity } = requestBody;

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
        .eq('variant_id', variantId); // Ensure inventory belongs to this variant

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

    return createSuccessResponse({ variant });
  } catch (error) {
    return handleError(error);
  }
};
