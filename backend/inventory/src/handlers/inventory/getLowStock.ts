import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
import { InventoryService } from '../../services/inventoryService';
import { SupabaseInventoryRepository } from '../../infrastructure/supabase/SupabaseInventoryRepository';
import { getSupabaseClient } from '../../libs/supabaseClient';

const supabase = getSupabaseClient();
const inventoryRepository = new SupabaseInventoryRepository(supabase);
const inventoryService = new InventoryService(inventoryRepository);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const result = await inventoryService.getLowStock();
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
