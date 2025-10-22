import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'inventory-product-images';

export interface PresignedUrlResult {
  uploadUrl: string;
  imageUrl: string;
  key: string;
}

/**
 * Generate a presigned URL for uploading an image to S3
 * @param folder - Folder path in S3 bucket (e.g., 'products', 'variants')
 * @param contentType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @param expiresIn - Expiration time in seconds (default: 5 minutes)
 * @returns Promise with presigned upload URL and final image URL
 */
export async function generatePresignedUploadUrl(
  folder: string,
  contentType: string = 'image/jpeg',
  expiresIn: number = 300
): Promise<PresignedUrlResult> {
  try {
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      throw new Error(`Invalid content type: ${contentType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate unique filename
    const fileExtension = contentType.split('/')[1];
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // Create the PUT command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // Construct the final public URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { uploadUrl, imageUrl, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple presigned URLs for batch upload
 * @param folder - Folder path in S3 bucket
 * @param count - Number of URLs to generate
 * @param contentType - MIME type of the images
 * @returns Promise with array of presigned URL results
 */
export async function generateMultiplePresignedUrls(
  folder: string,
  count: number,
  contentType: string = 'image/jpeg'
): Promise<PresignedUrlResult[]> {
  const promises = Array.from({ length: count }, () =>
    generatePresignedUploadUrl(folder, contentType)
  );
  return Promise.all(promises);
}

/**
 * Delete an image from S3
 * @param imageUrl - The full S3 URL or just the key
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    let key: string;
    if (imageUrl.startsWith('http')) {
      const urlParts = imageUrl.split('.amazonaws.com/');
      key = urlParts[1];
    } else {
      key = imageUrl;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple images from S3
 * @param imageUrls - Array of S3 URLs or keys
 */
export async function deleteImagesFromS3(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map((url) => deleteImageFromS3(url));
  await Promise.all(deletePromises);
}
