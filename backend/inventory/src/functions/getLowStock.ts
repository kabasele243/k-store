import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Get threshold from query parameters (default: 5)
    const threshold = parseInt(
      event.queryStringParameters?.threshold || '5',
      10
    );

    const supabase = getSupabaseClient();

    // Fetch all inventory items below the threshold with variant and product info
    const { data: lowStockItems, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        variant:variants(
          *,
          product:products(*)
        )
      `)
      .lt('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse({
      threshold,
      count: lowStockItems?.length || 0,
      items: lowStockItems || [],
    });
  } catch (error) {
    return handleError(error);
  }
};
