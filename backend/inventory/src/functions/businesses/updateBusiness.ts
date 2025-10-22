import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessId = event.pathParameters?.id;

    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: UpdateBusinessRequest = JSON.parse(event.body);

    const supabase = getSupabaseClient();

    // Verify business exists
    const { data: existingBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .single();

    if (fetchError || !existingBusiness) {
      throw new ApiError(404, 'Business not found');
    }

    // Update the business
    const { data: business, error } = await supabase
      .from('businesses')
      .update({
        name: requestBody.name,
        description: requestBody.description,
        email: requestBody.email,
        phone: requestBody.phone,
        address: requestBody.address,
        city: requestBody.city,
        state: requestBody.state,
        zip_code: requestBody.zip_code,
        country: requestBody.country,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(business);
  } catch (error) {
    return handleError(error);
  }
};
