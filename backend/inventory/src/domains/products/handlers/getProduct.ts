import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
} from '../../../libs/errorHandler';
import { getProductById } from '../services/productService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const productId = event.pathParameters?.productId!;
    const result = await getProductById(productId);
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
