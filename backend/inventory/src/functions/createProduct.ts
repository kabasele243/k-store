import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  createErrorResponse,
  ApiError,
} from '../libs/errorHandler';
import { CreateProductRequest } from '../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse request body
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateProductRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.name) {
      throw new ApiError(400, 'Product name is required');
    }

    const supabase = getSupabaseClient();

    // Create the product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: requestBody.name,
        description: requestBody.description,
        brand: requestBody.brand,
        category: requestBody.category,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse({ product }, 201);
  } catch (error) {
    return handleError(error);
  }
};
