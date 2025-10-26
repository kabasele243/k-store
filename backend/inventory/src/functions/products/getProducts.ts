import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = getSupabaseClient();

    // Fetch all products with their variants and sales
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        variants(
          *,
          sales(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse({ products: products || [] });
  } catch (error) {
    return handleError(error);
  }
};
