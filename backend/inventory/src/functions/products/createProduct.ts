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

    // Validate categories if provided
    if (requestBody.category_ids && requestBody.category_ids.length > 0) {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .in('id', requestBody.category_ids);

      if (categoriesError) throw categoriesError;

      if (!categories || categories.length !== requestBody.category_ids.length) {
        throw new ApiError(400, 'One or more category IDs are invalid');
      }
    }

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

    // Create product-category associations if category_ids provided
    if (requestBody.category_ids && requestBody.category_ids.length > 0) {
      const productCategories = requestBody.category_ids.map((categoryId) => ({
        product_id: product.id,
        category_id: categoryId,
      }));

      const { error: junctionError } = await supabase
        .from('product_categories')
        .insert(productCategories);

      if (junctionError) {
        // Rollback: delete the product if category association fails
        await supabase.from('products').delete().eq('id', product.id);
        throw junctionError;
      }
    }

    return createSuccessResponse({ product }, 201);
  } catch (error) {
    return handleError(error);
  }
};
