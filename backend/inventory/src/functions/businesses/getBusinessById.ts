import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessId = event.pathParameters?.id;

    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    const supabase = getSupabaseClient();

    const { data: business, error } = await supabase
      .from('businesses')
      .select('*, business_types(id, name, description)')
      .eq('id', businessId)
      .single();

    if (error || !business) {
      throw new ApiError(404, 'Business not found');
    }

    return createSuccessResponse(business);
  } catch (error) {
    return handleError(error);
  }
};
