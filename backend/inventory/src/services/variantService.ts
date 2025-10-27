import { ApiError } from '../libs/errorHandler';
import { IVariantRepository } from '../repositories/IVariantRepository';

export interface CreateVariantRequest {
  product_id: string;
  sku: string;
  attributes?: Record<string, any>;
  price?: number;
}

export interface UpdateVariantRequest {
  price?: number;
  sku?: string;
  attributes?: Record<string, any>;
  inventory_id?: string;
  quantity?: number;
}

export class VariantService {
  constructor(private readonly variantRepository: IVariantRepository) {}

  async createVariant(request: CreateVariantRequest) {
    if (!request.product_id) {
      throw new ApiError(400, 'Product ID is required');
    }
    if (!request.sku) {
      throw new ApiError(400, 'SKU is required');
    }

    const productExists = await this.variantRepository.productExists(request.product_id);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }

    const variant = await this.variantRepository.create(request);
    return { variant };
  }

  async updateVariant(variantId: string, request: UpdateVariantRequest) {
    if (!variantId) {
      throw new ApiError(400, 'Variant ID is required');
    }

    const { price, sku, attributes, inventory_id, quantity } = request;

    if (price === undefined && !sku && !attributes && (inventory_id === undefined || quantity === undefined)) {
      throw new ApiError(400, 'At least one field to update is required');
    }

    if (price !== undefined || sku || attributes) {
      await this.variantRepository.update(variantId, { price, sku, attributes });
    }

    if (inventory_id && quantity !== undefined) {
      await this.variantRepository.updateInventoryQuantity(variantId, inventory_id, quantity);
    }

    const variant = await this.variantRepository.findByIdWithInventory(variantId);
    if (!variant) {
      throw new ApiError(404, 'Variant not found');
    }

    return { variant };
  }
}
