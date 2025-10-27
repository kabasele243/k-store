import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
} from '../../libs/errorHandler';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { ProductService } from '../../services/productService';
import { SupabaseProductRepository } from '../../infrastructure/supabase/SupabaseProductRepository';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {

    const supabase = getSupabaseClient();
    const productRepository = new SupabaseProductRepository(supabase);
    const productService = new ProductService(productRepository);

    const productId = event.pathParameters?.productId!;
    const result = await productService.getProductById(productId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
