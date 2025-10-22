import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

interface CreateBusinessRequest {
  name: string;
  business_type_id: string;
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
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateBusinessRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.name) {
      throw new ApiError(400, 'Business name is required');
    }
    if (!requestBody.business_type_id) {
      throw new ApiError(400, 'Business type ID is required');
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

    // Create the business
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        name: requestBody.name,
        business_type_id: requestBody.business_type_id,
        description: requestBody.description,
        email: requestBody.email,
        phone: requestBody.phone,
        address: requestBody.address,
        city: requestBody.city,
        state: requestBody.state,
        zip_code: requestBody.zip_code,
        country: requestBody.country,
      })
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(business, 201);
  } catch (error) {
    return handleError(error);
  }
};
