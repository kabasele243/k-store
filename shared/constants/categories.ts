/**
 * Static Categories Configuration
 * Categories are organized by business type
 */

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  imagePath: string; // Relative path for the image
  tag?: string; // Optional tag like "NEW", "POPULAR", etc.
}

/**
 * Categories mapped by business type
 */
export const CATEGORIES_BY_BUSINESS_TYPE = {
  'clothing-boutique': [
    {
      id: 'robes',
      name: 'Robes',
      description: 'Collection de robes élégantes',
      imagePath: 'categories/robes.jpg',
      tag: 'POPULAR',
    },
    {
      id: 'pantalon',
      name: 'Pantalon',
      description: 'Collection de pantalons tendance',
      imagePath: 'categories/pantalon.jpg',
    },
    {
      id: 'jupes',
      name: 'Jupes',
      description: 'Collection de jupes stylées',
      imagePath: 'categories/jupes.jpg',
    },
    {
      id: 'chaussures',
      name: 'Chaussures',
      description: 'Collection de chaussures mode',
      imagePath: 'categories/chaussures.jpg',
    },
    {
      id: 'accessoires',
      name: 'Accessoires',
      description: 'Accessoires de mode et bijoux',
      imagePath: 'categories/accessoires.jpg',
      tag: 'NEW',
    },
  ],
  'shoe-store': [
    {
      id: 'sneakers',
      name: 'Sneakers',
      description: 'Baskets et chaussures de sport',
      imagePath: 'categories/chaussures.jpg',
    },
    {
      id: 'formal-shoes',
      name: 'Chaussures Formelles',
      description: 'Chaussures habillées',
      imagePath: 'categories/chaussures.jpg',
    },
    {
      id: 'boots',
      name: 'Bottes',
      description: 'Bottes et bottines',
      imagePath: 'categories/chaussures.jpg',
    },
  ],
  'accessories-shop': [
    {
      id: 'jewelry',
      name: 'Bijoux',
      description: 'Bijoux et accessoires précieux',
      imagePath: 'categories/accessoires.jpg',
    },
    {
      id: 'bags',
      name: 'Sacs',
      description: 'Sacs à main et sacs à dos',
      imagePath: 'categories/accessoires.jpg',
    },
    {
      id: 'belts',
      name: 'Ceintures',
      description: 'Ceintures et accessoires',
      imagePath: 'categories/accessoires.jpg',
    },
  ],
} as const;

// Type helpers
export type BusinessTypeId = keyof typeof CATEGORIES_BY_BUSINESS_TYPE;
export type CategoryId = typeof CATEGORIES_BY_BUSINESS_TYPE[BusinessTypeId][number]['id'];

// Get all categories (flat array)
export const getAllCategories = (): CategoryConfig[] => {
  return Object.values(CATEGORIES_BY_BUSINESS_TYPE).flat();
};

// Get categories for a specific business type
export const getCategoriesByBusinessType = (businessTypeId: string): CategoryConfig[] => {
  return CATEGORIES_BY_BUSINESS_TYPE[businessTypeId as BusinessTypeId] || [];
};

// Get a single category by id (searches across all business types)
export const getCategoryById = (categoryId: string): CategoryConfig | undefined => {
  return getAllCategories().find(cat => cat.id === categoryId);
};

// Validate if a category belongs to a business type
export const isCategoryValidForBusinessType = (
  categoryId: string,
  businessTypeId: string
): boolean => {
  const categories = getCategoriesByBusinessType(businessTypeId);
  return categories.some(cat => cat.id === categoryId);
};

// Get category IDs for a business type
export const getCategoryIdsByBusinessType = (businessTypeId: string): string[] => {
  return getCategoriesByBusinessType(businessTypeId).map(cat => cat.id);
};
