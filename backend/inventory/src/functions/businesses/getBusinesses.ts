import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = getSupabaseClient();

    // Get optional query parameters
    const businessTypeId = event.queryStringParameters?.business_type_id;

    let query = supabase
      .from('businesses')
      .select('*, business_types(id, name, description)')
      .order('name', { ascending: true });

    // Filter by business type if provided
    if (businessTypeId) {
      query = query.eq('business_type_id', businessTypeId);
    }

    const { data: businesses, error } = await query;

    if (error) throw error;

    return createSuccessResponse(businesses);
  } catch (error) {
    return handleError(error);
  }
};
