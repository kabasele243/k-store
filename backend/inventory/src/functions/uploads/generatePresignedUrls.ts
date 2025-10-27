import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { generatePresignedUrls, GeneratePresignedUrlsRequest } from '../../services/uploads/uploadService';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: GeneratePresignedUrlsRequest = JSON.parse(event.body);
    const result = await generatePresignedUrls(requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error in generatePresignedUrls:', error);
    console.error('Request body:', event.body);
    return handleError(error);
  }
};
