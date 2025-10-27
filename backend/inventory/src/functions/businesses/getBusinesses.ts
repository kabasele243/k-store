import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
import { getBusinesses } from '../../services/businesses/businessService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const businessTypeId = event.queryStringParameters?.business_type_id;
    const businesses = await getBusinesses(businessTypeId);
    return createSuccessResponse(businesses);
  } catch (error) {
    return handleError(error);
  }
};
