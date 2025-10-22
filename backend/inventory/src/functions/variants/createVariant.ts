import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

interface CreateVariantRequest {
  product_id: string;
  sku: string;
  attributes?: Record<string, any>; // e.g., { size: "M", color: "Blue" }
  price?: number;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateVariantRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.product_id) {
      throw new ApiError(400, 'Product ID is required');
    }
    if (!requestBody.sku) {
      throw new ApiError(400, 'SKU is required');
    }

    const supabase = getSupabaseClient();

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', requestBody.product_id)
      .single();

    if (productError || !product) {
      throw new ApiError(404, 'Product not found');
    }

    // Create the variant
    const { data: variant, error } = await supabase
      .from('variants')
      .insert({
        product_id: requestBody.product_id,
        sku: requestBody.sku,
        attributes: requestBody.attributes || {},
        price: requestBody.price,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse({ variant }, 201);
  } catch (error) {
    return handleError(error);
  }
};
