import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { recordSale } from '../../services/inventoryService';

interface RecordSaleRequest {
  variant_id: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: RecordSaleRequest = JSON.parse(event.body);
    const result = await recordSale(requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
