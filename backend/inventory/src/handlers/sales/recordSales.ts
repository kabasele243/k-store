import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { SalesService } from '../../services/salesService';
import { SupabaseSalesRepository } from '../../infrastructure/supabase/SupabaseSalesRepository';
import { getSupabaseClient } from '../../libs/supabaseClient';

const supabase = getSupabaseClient();
const salesRepository = new SupabaseSalesRepository(supabase);
const salesService = new SalesService(salesRepository);

interface RecordSalesRequest {
  variant_id: string;
  quantity: number;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: RecordSalesRequest = JSON.parse(event.body);
    const result = await salesService.recordSales(requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
