import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
} from '../../libs/errorHandler';
import { getBusinessById } from '../../services/businessService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessId = event.pathParameters?.id!;
    const business = await getBusinessById(businessId);
    return createSuccessResponse(business);
  } catch (error) {
    return handleError(error);
  }
};
