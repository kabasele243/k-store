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

    // Check if business has users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('business_id', businessId)
      .limit(1);

    if (usersError) throw usersError;

    if (users && users.length > 0) {
      throw new ApiError(
        400,
        'Cannot delete business with assigned users. Please reassign or remove users first.'
      );
    }

    // Delete the business
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;

    return createSuccessResponse({ message: 'Business deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
};
