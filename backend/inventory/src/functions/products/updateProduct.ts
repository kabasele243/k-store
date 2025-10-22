import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { UpdateProductRequest } from '../../libs/types';
import { deleteImageFromS3 } from '../../libs/s3Client';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }

    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: UpdateProductRequest = JSON.parse(event.body);

    // Validate at least one field to update
    if (
      !requestBody.name &&
      !requestBody.description &&
      !requestBody.brand &&
      !requestBody.category &&
      !requestBody.images
    ) {
      throw new ApiError(400, 'At least one field is required to update');
    }

    const supabase = getSupabaseClient();

    // Update the product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...(requestBody.name && { name: requestBody.name }),
        ...(requestBody.description !== undefined && {
          description: requestBody.description,
        }),
        ...(requestBody.brand !== undefined && { brand: requestBody.brand }),
        ...(requestBody.category !== undefined && {
          category: requestBody.category,
        }),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, 'Product not found');
      }
      throw error;
    }

    // Update product images if provided (replaces all existing images)
    if (requestBody.images) {
      // Get existing images to delete from S3
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      // Delete existing images from S3
      if (existingImages && existingImages.length > 0) {
        const deletePromises = existingImages.map((img) =>
          deleteImageFromS3(img.image_url).catch((err) =>
            console.error('Failed to delete image from S3:', err)
          )
        );
        await Promise.all(deletePromises);
      }

      // Delete existing image records
      await supabase.from('product_images').delete().eq('product_id', productId);

      // Add new images if any
      if (requestBody.images.length > 0) {
        const productImages = requestBody.images.map((image, index) => ({
          product_id: productId,
          image_url: image.image_url,
          alt_text: image.alt_text,
          display_order: index,
          is_primary: image.is_primary ?? (index === 0),
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(productImages);

        if (imagesError) throw imagesError;
      }
    }

    return createSuccessResponse({ product });
  } catch (error) {
    return handleError(error);
  }
};
