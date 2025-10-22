import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { AddStockRequest } from '../../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: AddStockRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.variant_id) {
      throw new ApiError(400, 'Variant ID is required');
    }
    if (!requestBody.quantity || requestBody.quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than 0');
    }
    if (!requestBody.reason) {
      throw new ApiError(400, 'Reason is required');
    }

    const supabase = getSupabaseClient();
    const userId = event.requestContext.authorizer?.lambda?.userId;

    if (!userId) {
      throw new ApiError(401, 'User ID not found in context');
    }

    const location = requestBody.location || 'Default';

    // Start a transaction-like operation using RPC or multiple queries
    // First, get or create the inventory item
    const { data: existingInventory, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('variant_id', requestBody.variant_id)
      .eq('location', location)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let updatedInventory;

    if (existingInventory) {
      // Update existing inventory
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          quantity: existingInventory.quantity + requestBody.quantity,
        })
        .eq('id', existingInventory.id)
        .select()
        .single();

      if (error) throw error;
      updatedInventory = data;
    } else {
      // Create new inventory item
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          variant_id: requestBody.variant_id,
          quantity: requestBody.quantity,
          location: location,
        })
        .select()
        .single();

      if (error) throw error;
      updatedInventory = data;
    }

    // Record the stock movement
    const { data: stockMovement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: requestBody.variant_id,
        quantity_change: requestBody.quantity,
        reason: requestBody.reason,
        user_id: userId,
      })
      .select()
      .single();

    if (movementError) throw movementError;

    return createSuccessResponse({
      inventory: updatedInventory,
      movement: stockMovement,
    });
  } catch (error) {
    return handleError(error);
  }
};
