export interface Business {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_type_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateBusinessData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface IBusinessRepository {
  /**
   * Find a business by ID with its business type
   */
  findById(businessId: string): Promise<Business | null>;

  /**
   * Get all businesses with optional filtering by business type
   */
  findAll(businessTypeId?: string): Promise<Business[]>;

  /**
   * Update a business
   */
  update(businessId: string, data: UpdateBusinessData): Promise<Business>;

  /**
   * Check if business exists
   */
  exists(businessId: string): Promise<boolean>;

  /**
   * Check if business has assigned users
   */
  hasUsers(businessId: string): Promise<boolean>;

  /**
   * Delete a business
   */
  delete(businessId: string): Promise<void>;
}
