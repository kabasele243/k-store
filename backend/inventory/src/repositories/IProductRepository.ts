export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  variants?: any[];
}

export interface ProductImage {
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
}

export interface IProductRepository {
  /**
   * Find a product by ID with its variants and sales
   */
  findById(productId: string): Promise<Product | null>;

  /**
   * Get all products with their variants and sales
   */
  findAll(): Promise<Product[]>;

  /**
   * Update a product
   */
  update(productId: string, data: UpdateProductData): Promise<Product>;

  /**
   * Get existing product images
   */
  getProductImages(productId: string): Promise<{ image_url: string }[]>;

  /**
   * Delete all product images
   */
  deleteProductImages(productId: string): Promise<void>;

  /**
   * Insert new product images
   */
  insertProductImages(productId: string, images: ProductImage[]): Promise<void>;
}
