import { getSupabaseClient } from '../../../libs/supabaseClient';
import { ApiError } from '../../../libs/errorHandler';
import { UpdateProductRequest } from '../../../libs/types';
import { deleteImageFromS3 } from '../../../libs/s3Client';

export const getProductById = async (productId: string) => {
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  const supabase = getSupabaseClient();

  // Fetch product with variants and sales
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:variants(
        *,
        sales(*)
      )
    `)
    .eq('id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError(404, 'Product not found');
    }
    throw error;
  }

  return { product };
};

export const getProducts = async () => {
  const supabase = getSupabaseClient();

  // Fetch all products with their variants and sales
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      variants(
        *,
        sales(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return { products: products || [] };
};

export const updateProduct = async (
  productId: string,
  requestBody: UpdateProductRequest
) => {
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

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

  return { product };
};
