import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../../libs/errorHandler';
import {
  IProductRepository,
  Product,
  ProductImage,
  UpdateProductData,
} from '../../repositories/IProductRepository';
import { deleteImageFromS3 } from '../../libs/s3Client';

export class SupabaseProductRepository implements IProductRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(productId: string): Promise<Product | null> {
    const { data: product, error } = await this.supabase
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
        return null;
      }
      throw error;
    }

    return product;
  }

  async findAll(): Promise<Product[]> {
    const { data: products, error } = await this.supabase
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

    return products || [];
  }

  async update(productId: string, data: UpdateProductData): Promise<Product> {
    const { data: product, error } = await this.supabase
      .from('products')
      .update({
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.category !== undefined && { category: data.category }),
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

    return product;
  }

  async getProductImages(productId: string): Promise<{ image_url: string }[]> {
    const { data: existingImages } = await this.supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId);

    return existingImages || [];
  }

  async deleteProductImages(productId: string): Promise<void> {
    // Get existing images to delete from S3
    const existingImages = await this.getProductImages(productId);

    // Delete existing images from S3
    if (existingImages.length > 0) {
      const deletePromises = existingImages.map((img) =>
        deleteImageFromS3(img.image_url).catch((err) =>
          console.error('Failed to delete image from S3:', err)
        )
      );
      await Promise.all(deletePromises);
    }

    // Delete existing image records
    await this.supabase.from('product_images').delete().eq('product_id', productId);
  }

  async insertProductImages(productId: string, images: ProductImage[]): Promise<void> {
    if (images.length === 0) return;

    const productImages = images.map((image, index) => ({
      product_id: productId,
      image_url: image.image_url,
      alt_text: image.alt_text,
      display_order: index,
      is_primary: image.is_primary ?? (index === 0),
    }));

    const { error: imagesError } = await this.supabase
      .from('product_images')
      .insert(productImages);

    if (imagesError) throw imagesError;
  }
}
