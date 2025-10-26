import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

interface RecordSalesRequest {
  variant_id: string;
  quantity: number; // Number of sales to record
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: RecordSalesRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.variant_id) {
      throw new ApiError(400, 'Variant ID is required');
    }
    if (!requestBody.quantity || requestBody.quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than 0');
    }

    const supabase = getSupabaseClient();

    // Verify variant exists
    const { data: variant, error: variantError } = await supabase
      .from('variants')
      .select('id')
      .eq('id', requestBody.variant_id)
      .single();

    if (variantError || !variant) {
      throw new ApiError(404, 'Variant not found');
    }

    // Create multiple sale records
    const salesToInsert = Array.from({ length: requestBody.quantity }, () => ({
      variant_id: requestBody.variant_id,
    }));

    const { data: sales, error } = await supabase
      .from('sales')
      .insert(salesToInsert)
      .select();

    if (error) throw error;

    return createSuccessResponse({
      message: `Recorded ${requestBody.quantity} sales`,
      sales_recorded: sales?.length || 0,
      sales,
    });
  } catch (error) {
    return handleError(error);
  }
};
