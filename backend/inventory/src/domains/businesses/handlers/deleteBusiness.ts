import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../../libs/errorHandler';
import { deleteBusiness } from '../services/businessService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessId = event.pathParameters?.id;

    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    const result = await deleteBusiness(businessId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
