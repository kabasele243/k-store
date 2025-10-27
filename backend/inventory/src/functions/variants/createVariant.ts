import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { createVariant, CreateVariantRequest } from '../../services/variants/variantService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateVariantRequest = JSON.parse(event.body);
    const result = await createVariant(requestBody);
    return createSuccessResponse(result, 201);
  } catch (error) {
    return handleError(error);
  }
};
