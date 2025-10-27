import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { UpdateProductRequest } from '../../libs/types';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { ProductService } from '../../services/productService';
import { SupabaseProductRepository } from '../../infrastructure/supabase/SupabaseProductRepository';

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

    // Dependency injection
    const supabase = getSupabaseClient();
    const productRepository = new SupabaseProductRepository(supabase);
    const productService = new ProductService(productRepository);

    const requestBody: UpdateProductRequest = JSON.parse(event.body);
    const result = await productService.updateProduct(productId, requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
