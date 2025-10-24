import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { generateMultiplePresignedUrls } from '../../libs/s3Client';

interface GeneratePresignedUrlsRequest {
  folder: string; // 'products', 'variants', or 'categories'
  count: number; // Number of URLs to generate
  contentType?: string; // Optional content type, defaults to 'image/jpeg'
  entity_id?: string; // Optional product_id, variant_id, or category_id to organize files
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: GeneratePresignedUrlsRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.folder) {
      throw new ApiError(400, 'Folder is required (e.g., "products" or "variants")');
    }

    if (!requestBody.count || requestBody.count < 1 || requestBody.count > 10) {
      throw new ApiError(400, 'Count must be between 1 and 10');
    }

    // Validate folder
    const allowedFolders = ['products', 'variants', 'categories'];
    if (!allowedFolders.includes(requestBody.folder)) {
      throw new ApiError(400, `Folder must be one of: ${allowedFolders.join(', ')}`);
    }

    // Construct folder path with entity_id if provided
    const folderPath = requestBody.entity_id
      ? `${requestBody.folder}/${requestBody.entity_id}`
      : requestBody.folder;

    // Generate presigned URLs
    const urls = await generateMultiplePresignedUrls(
      folderPath,
      requestBody.count,
      requestBody.contentType || 'image/jpeg'
    );

    return createSuccessResponse({
      urls,
      expiresIn: 300, // 5 minutes
      instructions: {
        step1: 'Use the uploadUrl to PUT your image file',
        step2: 'Send the imageUrl to the product/variant creation endpoint',
        example: 'curl -X PUT "{uploadUrl}" -H "Content-Type: image/jpeg" --data-binary "@image.jpg"',
      },
    });
  } catch (error) {
    console.error('Error in generatePresignedUrls:', error);
    console.error('Request body:', event.body);
    return handleError(error);
  }
};
