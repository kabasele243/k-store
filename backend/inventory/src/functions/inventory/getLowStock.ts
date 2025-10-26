import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = getSupabaseClient();

    // Get sales count per variant
    const { data: salesCounts, error } = await supabase
      .rpc('get_sales_count_per_variant');

    if (error) {
      throw error;
    }

    return createSuccessResponse({
      count: salesCounts?.length || 0,
      variants: salesCounts || [],
    });
  } catch (error) {
    return handleError(error);
  }
};
