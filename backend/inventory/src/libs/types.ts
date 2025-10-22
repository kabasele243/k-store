// Database table types
export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  created_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  attributes?: Record<string, any>; // e.g., { size: "M", color: "Blue" }
  price?: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  variant_id: string;
  quantity: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  quantity_change: number;
  reason: string;
  user_id: string;
  created_at: string;
}

// API Request/Response types
export interface CreateProductRequest {
  name: string;
  description?: string;
  brand?: string;
  category?: string; // Deprecated - use category_id or category_ids instead
  category_id?: string; // Single category UUID
  category_ids?: string[]; // Array of category UUIDs (for multiple categories)
  variants?: {
    sku: string;
    price: number;
    attributes?: Record<string, any>;
    inventory?: {
      quantity: number;
      location?: string;
    }[];
  }[];
  images?: {
    image_url: string; // S3 URL from presigned upload
    alt_text?: string;
    is_primary?: boolean;
  }[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  images?: {
    image_url: string; // S3 URL from presigned upload
    alt_text?: string;
    is_primary?: boolean;
  }[];
}

export interface AddStockRequest {
  variant_id: string;
  quantity: number;
  location?: string;
  reason: string;
}

export interface RemoveStockRequest {
  variant_id: string;
  quantity: number;
  location?: string;
  reason: string;
}

export interface ProductWithVariants extends Product {
  variants?: VariantWithInventory[];
}

export interface VariantWithInventory extends Variant {
  inventory?: InventoryItem[];
}

// JWT Payload type
export interface JWTPayload {
  sub: string; // user id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Business Type and Category types
export interface BusinessType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_type_id: string;
  parent_category_id?: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface ProductCategory {
  id: string;
  product_id: string;
  category_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  business_type_id?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// API Request types for new entities
export interface CreateCategoryRequest {
  business_type_id: string;
  parent_category_id?: string;
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parent_category_id?: string;
}

// Lambda Event types
export interface AuthorizerContext {
  userId: string;
  email?: string;
  role?: string;
}
