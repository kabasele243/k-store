import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { updateBusiness, UpdateBusinessRequest } from '../../services/businesses/businessService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessId = event.pathParameters?.id;

    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: UpdateBusinessRequest = JSON.parse(event.body);
    const business = await updateBusiness(businessId, requestBody);
    return createSuccessResponse(business);
  } catch (error) {
    return handleError(error);
  }
};
