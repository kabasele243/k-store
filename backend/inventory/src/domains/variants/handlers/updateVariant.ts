import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../../libs/errorHandler';
import { updateVariant, UpdateVariantRequest } from '../services/variantService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const variantId = event.pathParameters?.variantId;

    if (!variantId) {
      throw new ApiError(400, 'Variant ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: UpdateVariantRequest = JSON.parse(event.body);
    const result = await updateVariant(variantId, requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
