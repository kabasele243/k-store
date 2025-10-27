import { ApiError } from '../libs/errorHandler';
import { UpdateProductRequest } from '../libs/types';
import { IProductRepository } from '../repositories/IProductRepository';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getProductById(productId: string) {
    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return { product };
  }

  async getProducts() {
    const products = await this.productRepository.findAll();
    return { products };
  }

  async updateProduct(productId: string, requestBody: UpdateProductRequest) {
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

    // Update the product
    const product = await this.productRepository.update(productId, {
      name: requestBody.name,
      description: requestBody.description,
      brand: requestBody.brand,
      category: requestBody.category,
    });

    // Update product images if provided (replaces all existing images)
    if (requestBody.images) {
      await this.productRepository.deleteProductImages(productId);
      await this.productRepository.insertProductImages(productId, requestBody.images);
    }

    return { product };
  }
}
