import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { CreateProductRequest } from '../../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse request body
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody: CreateProductRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.name) {
      throw new ApiError(400, 'Product name is required');
    }

    const supabase = getSupabaseClient();

    // Validate category if provided
    if (requestBody.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', requestBody.category_id)
        .single();

      if (categoryError || !category) {
        throw new ApiError(400, 'Invalid category ID');
      }
    }

    // Create the product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: requestBody.name,
        description: requestBody.description,
        brand: requestBody.brand,
        category: requestBody.category,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create product-category association if category_id provided
    if (requestBody.category_id) {
      const { error: junctionError } = await supabase
        .from('product_categories')
        .insert({
          product_id: product.id,
          category_id: requestBody.category_id,
        });

      if (junctionError) {
        // Rollback: delete the product if category association fails
        await supabase.from('products').delete().eq('id', product.id);
        throw junctionError;
      }
    }

    // Create variants if provided
    if (requestBody.variants && requestBody.variants.length > 0) {
      for (const variantData of requestBody.variants) {
        // Create the variant
        const { data: variant, error: variantError } = await supabase
          .from('variants')
          .insert({
            product_id: product.id,
            sku: variantData.sku,
            price: variantData.price,
            attributes: variantData.attributes,
          })
          .select()
          .single();

        if (variantError) {
          // Rollback: delete the product if variant creation fails
          await supabase.from('products').delete().eq('id', product.id);
          throw variantError;
        }

        // Create inventory for this variant if provided
        if (variantData.inventory && variantData.inventory.length > 0) {
          const inventoryItems = variantData.inventory.map((inv) => ({
            variant_id: variant.id,
            quantity: inv.quantity,
            location: inv.location || 'Default Location',
          }));

          const { error: inventoryError } = await supabase
            .from('inventory_items')
            .insert(inventoryItems);

          if (inventoryError) {
            // Rollback: delete the product if inventory creation fails
            await supabase.from('products').delete().eq('id', product.id);
            throw inventoryError;
          }
        }
      }
    }

    // Create product images if provided (using presigned URLs)
    if (requestBody.images && requestBody.images.length > 0) {
      const productImages = requestBody.images.map((image, index) => ({
        product_id: product.id,
        image_url: image.image_url,
        alt_text: image.alt_text,
        display_order: index,
        is_primary: image.is_primary ?? (index === 0),
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(productImages);

      if (imagesError) {
        // Rollback: delete the product if image creation fails
        await supabase.from('products').delete().eq('id', product.id);
        throw imagesError;
      }
    }

    // Fetch the complete product with variants, inventory, and categories
    const { data: completeProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        variants (
          *,
          inventory_items (*)
        ),
        product_categories (
          category_id,
          categories (*)
        )
      `)
      .eq('id', product.id)
      .single();

    if (fetchError) throw fetchError;

    return createSuccessResponse({ product: completeProduct }, 201);
  } catch (error) {
    return handleError(error);
  }
};
