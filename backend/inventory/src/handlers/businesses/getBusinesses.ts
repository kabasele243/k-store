import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
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
    const businessTypeId = event.queryStringParameters?.business_type_id;
    const businesses = await businessService.getBusinesses(businessTypeId);
    return createSuccessResponse(businesses);
  } catch (error) {
    return handleError(error);
  }
};
