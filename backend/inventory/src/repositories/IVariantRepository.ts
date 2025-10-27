export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  price?: number;
  attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateVariantData {
  product_id: string;
  sku: string;
  price?: number;
  attributes?: Record<string, any>;
}

export interface UpdateVariantData {
  price?: number;
  sku?: string;
  attributes?: Record<string, any>;
}

export interface IVariantRepository {
  /**
   * Create a new variant
   */
  create(data: CreateVariantData): Promise<Variant>;

  /**
   * Find a variant by ID with inventory
   */
  findByIdWithInventory(variantId: string): Promise<Variant | null>;

  /**
   * Update a variant
   */
  update(variantId: string, data: UpdateVariantData): Promise<void>;

  /**
   * Update inventory quantity for a variant
   */
  updateInventoryQuantity(variantId: string, inventoryId: string, quantity: number): Promise<void>;

  /**
   * Check if product exists
   */
  productExists(productId: string): Promise<boolean>;
}
