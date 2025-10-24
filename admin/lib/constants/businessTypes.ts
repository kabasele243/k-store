/**
 * Static Business Types Configuration
 * These are the types of businesses supported by the platform
 */

export interface BusinessTypeConfig {
  id: string;
  name: string;
  description: string;
}

export const BUSINESS_TYPES = {
  CLOTHING_BOUTIQUE: {
    id: 'clothing-boutique',
    name: 'Boutique de Vêtements',
    description: 'Fashion and clothing retail store',
  },
  SHOE_STORE: {
    id: 'shoe-store',
    name: 'Magasin de Chaussures',
    description: 'Footwear retail store',
  },
  ACCESSORIES_SHOP: {
    id: 'accessories-shop',
    name: 'Boutique d\'Accessoires',
    description: 'Fashion accessories and jewelry store',
  },
} as const;

// Type helpers
export type BusinessTypeId = typeof BUSINESS_TYPES[keyof typeof BUSINESS_TYPES]['id'];

// Array of all business types
export const ALL_BUSINESS_TYPES: BusinessTypeConfig[] = Object.values(BUSINESS_TYPES);

// Helper to get business type by id
export const getBusinessTypeById = (id: string): BusinessTypeConfig | undefined => {
  return ALL_BUSINESS_TYPES.find(bt => bt.id === id);
};

// Helper to validate business type id
export const isValidBusinessTypeId = (id: string): boolean => {
  return ALL_BUSINESS_TYPES.some(bt => bt.id === id);
};
