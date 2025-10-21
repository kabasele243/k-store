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
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
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

// Lambda Event types
export interface AuthorizerContext {
  userId: string;
  email?: string;
  role?: string;
}
