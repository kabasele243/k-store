import { ApiError } from '../libs/errorHandler';
import { IUploadRepository } from '../repositories/IUploadRepository';

export interface GeneratePresignedUrlsRequest {
  folder: string;
  count: number;
  contentType?: string;
  entity_id?: string;
}

export class UploadService {
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async generatePresignedUrls(request: GeneratePresignedUrlsRequest) {
    if (!request.folder) {
      throw new ApiError(400, 'Folder is required (e.g., "products" or "variants")');
    }

    if (!request.count || request.count < 1 || request.count > 10) {
      throw new ApiError(400, 'Count must be between 1 and 10');
    }

    const allowedFolders = ['products', 'variants', 'categories'];
    if (!allowedFolders.includes(request.folder)) {
      throw new ApiError(400, `Folder must be one of: ${allowedFolders.join(', ')}`);
    }

    const folderPath = request.entity_id
      ? `${request.folder}/${request.entity_id}`
      : request.folder;

    const urls = await this.uploadRepository.generatePresignedUrls(
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
  }
}
