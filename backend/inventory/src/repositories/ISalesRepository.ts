export interface Sale {
  id: string;
  variant_id: string;
  created_at: string;
}

export interface ISalesRepository {
  /**
   * Check if variant exists
   */
  variantExists(variantId: string): Promise<boolean>;

  /**
   * Record multiple sales for a variant
   */
  recordSales(variantId: string, quantity: number): Promise<Sale[]>;

  /**
   * Record a single sale for a variant
   */
  recordSale(variantId: string): Promise<Sale>;

  /**
   * Get sales count per variant (low stock analysis)
   */
  getSalesCountPerVariant(): Promise<any[]>;
}
