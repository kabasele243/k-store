import { ApiError } from '../../../libs/errorHandler';
import { generateMultiplePresignedUrls } from '../../../libs/s3Client';

export interface GeneratePresignedUrlsRequest {
  folder: string;
  count: number;
  contentType?: string;
  entity_id?: string;
}

export const generatePresignedUrls = async (request: GeneratePresignedUrlsRequest) => {
  // Validate required fields
  if (!request.folder) {
    throw new ApiError(400, 'Folder is required (e.g., "products" or "variants")');
  }

  if (!request.count || request.count < 1 || request.count > 10) {
    throw new ApiError(400, 'Count must be between 1 and 10');
  }

  // Validate folder
  const allowedFolders = ['products', 'variants', 'categories'];
  if (!allowedFolders.includes(request.folder)) {
    throw new ApiError(400, `Folder must be one of: ${allowedFolders.join(', ')}`);
  }

  // Construct folder path with entity_id if provided
  const folderPath = request.entity_id
    ? `${request.folder}/${request.entity_id}`
    : request.folder;

  // Generate presigned URLs
  const urls = await generateMultiplePresignedUrls(
    folderPath,
    request.count,
    request.contentType || 'image/jpeg'
  );

  return {
    urls,
    expiresIn: 300,
    instructions: {
      step1: 'Use the uploadUrl to PUT your image file',
      step2: 'Send the imageUrl to the product/variant creation endpoint',
      example: 'curl -X PUT "{uploadUrl}" -H "Content-Type: image/jpeg" --data-binary "@image.jpg"',
    },
  };
};
