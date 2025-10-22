import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../libs/errorHandler';
import { CreateCategoryRequest } from '../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateCategoryRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.business_type_id) {
      throw new ApiError(400, 'Business type ID is required');
    }
    if (!requestBody.name) {
      throw new ApiError(400, 'Category name is required');
    }

    const supabase = getSupabaseClient();

    // Verify business type exists
    const { data: businessType, error: businessTypeError } = await supabase
      .from('business_types')
      .select('id')
      .eq('id', requestBody.business_type_id)
      .single();

    if (businessTypeError || !businessType) {
      throw new ApiError(404, 'Business type not found');
    }

    // If parent_category_id is provided, verify it exists and belongs to the same business type
    if (requestBody.parent_category_id) {
      const { data: parentCategory, error: parentError } = await supabase
        .from('categories')
        .select('id, business_type_id')
        .eq('id', requestBody.parent_category_id)
        .single();

      if (parentError || !parentCategory) {
        throw new ApiError(404, 'Parent category not found');
      }

      if (parentCategory.business_type_id !== requestBody.business_type_id) {
        throw new ApiError(
          400,
          'Parent category must belong to the same business type'
        );
      }
    }

    // Create the category
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        business_type_id: requestBody.business_type_id,
        parent_category_id: requestBody.parent_category_id || null,
        name: requestBody.name,
        description: requestBody.description,
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(category);
  } catch (error) {
    return handleError(error);
  }
};
