import { IUploadRepository, PresignedUrl } from '../../repositories/IUploadRepository';
import { generateMultiplePresignedUrls } from '../../libs/s3Client';

export class SupabaseUploadRepository implements IUploadRepository {
  async generatePresignedUrls(
    folderPath: string,
    count: number,
    contentType: string
  ): Promise<PresignedUrl[]> {
    return await generateMultiplePresignedUrls(folderPath, count, contentType);
  }
}
