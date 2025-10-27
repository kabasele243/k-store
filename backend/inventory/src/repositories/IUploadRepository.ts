export interface PresignedUrl {
  uploadUrl: string;
  imageUrl: string;
}

export interface IUploadRepository {
  /**
   * Generate multiple presigned URLs for file uploads
   */
  generatePresignedUrls(
    folderPath: string,
    count: number,
    contentType: string
  ): Promise<PresignedUrl[]>;
}
