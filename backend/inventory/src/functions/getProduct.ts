import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }

    const supabase = getSupabaseClient();

    // Fetch product with variants and inventory
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:variants(
          *,
          inventory:inventory_items(*)
        )
      `)
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, 'Product not found');
      }
      throw error;
    }

    return createSuccessResponse({ product });
  } catch (error) {
    return handleError(error);
  }
};
