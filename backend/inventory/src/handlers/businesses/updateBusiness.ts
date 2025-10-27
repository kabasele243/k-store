import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { BusinessService, UpdateBusinessRequest } from '../../services/businessService';
import { SupabaseBusinessRepository } from '../../infrastructure/supabase/SupabaseBusinessRepository';
import { getSupabaseClient } from '../../libs/supabaseClient';

const supabase = getSupabaseClient();
const businessRepository = new SupabaseBusinessRepository(supabase);
const businessService = new BusinessService(businessRepository);

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
    const business = await businessService.updateBusiness(businessId, requestBody);
    return createSuccessResponse(business);
  } catch (error) {
    return handleError(error);
  }
};
