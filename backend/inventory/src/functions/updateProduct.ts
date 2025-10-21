import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../libs/errorHandler';
import { UpdateProductRequest } from '../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: UpdateProductRequest = JSON.parse(event.body);

    // Validate at least one field to update
    if (
      !requestBody.name &&
      !requestBody.description &&
      !requestBody.brand &&
      !requestBody.category
    ) {
      throw new ApiError(400, 'At least one field is required to update');
    }

    const supabase = getSupabaseClient();

    // Update the product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...(requestBody.name && { name: requestBody.name }),
        ...(requestBody.description !== undefined && {
          description: requestBody.description,
        }),
        ...(requestBody.brand !== undefined && { brand: requestBody.brand }),
        ...(requestBody.category !== undefined && {
          category: requestBody.category,
        }),
      })
      .eq('id', productId)
      .select()
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
