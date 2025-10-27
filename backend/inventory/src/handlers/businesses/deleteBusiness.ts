import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { BusinessService } from '../../services/businessService';
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

    const result = await businessService.deleteBusiness(businessId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
