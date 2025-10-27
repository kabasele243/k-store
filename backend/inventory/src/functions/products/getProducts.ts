import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
import { getProducts } from '../../services/products/productService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const result = await getProducts();
    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
};
