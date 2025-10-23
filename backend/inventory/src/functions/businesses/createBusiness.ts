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
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
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
        address_line1: requestBody.address_line1,
        address_line2: requestBody.address_line2,
        city: requestBody.city,
        state_province: requestBody.state_province,
        postal_code: requestBody.postal_code,
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
