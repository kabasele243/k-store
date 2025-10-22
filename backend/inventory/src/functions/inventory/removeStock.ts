import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { RemoveStockRequest } from '../../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: RemoveStockRequest = JSON.parse(event.body);

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

    // Get the existing inventory item
    const { data: existingInventory, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('variant_id', requestBody.variant_id)
      .eq('location', location)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new ApiError(404, 'Inventory item not found for this variant and location');
      }
      throw fetchError;
    }

    // Check if there's enough stock
    if (existingInventory.quantity < requestBody.quantity) {
      throw new ApiError(400, `Insufficient stock. Available: ${existingInventory.quantity}, Requested: ${requestBody.quantity}`);
    }

    // Update inventory
    const newQuantity = existingInventory.quantity - requestBody.quantity;
    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', existingInventory.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record the stock movement (negative quantity)
    const { data: stockMovement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        variant_id: requestBody.variant_id,
        quantity_change: -requestBody.quantity,
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
