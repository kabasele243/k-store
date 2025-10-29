import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
import { SalesService } from '../../services/salesService';
import { SupabaseSalesRepository } from '../../infrastructure/supabase/SupabaseSalesRepository';
import { getSupabaseClient } from '../../libs/supabaseClient';

const supabase = getSupabaseClient();
const salesRepository = new SupabaseSalesRepository(supabase);
const salesService = new SalesService(salesRepository);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const result = await salesService.getSalesReport();
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
