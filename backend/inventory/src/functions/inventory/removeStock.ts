import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';

interface RecordSaleRequest {
  variant_id: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: RecordSaleRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.variant_id) {
      throw new ApiError(400, 'Variant ID is required');
    }

    const supabase = getSupabaseClient();

    // Verify variant exists
    const { error: variantError } = await supabase
      .from('variants')
      .select('id')
      .eq('id', requestBody.variant_id)
      .single();

    if (variantError) {
      if (variantError.code === 'PGRST116') {
        throw new ApiError(404, 'Variant not found');
      }
      throw variantError;
    }

    // Record the sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        variant_id: requestBody.variant_id,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    return createSuccessResponse({
      message: 'Sale recorded successfully',
      sale,
    });
  } catch (error) {
    return handleError(error);
  }
};
