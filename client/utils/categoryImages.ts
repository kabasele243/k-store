/**
 * Category Image Mappings for React Native
 * React Native requires static require() calls for local images
 */

export const CATEGORY_IMAGES: Record<string, any> = {
  'robes': require('@/assets/images/categories/robes.jpg'),
  'pantalon': require('@/assets/images/categories/pantalon.jpg'),
  'jupes': require('@/assets/images/categories/jupes.jpg'),
  'chaussures': require('@/assets/images/categories/chaussures.jpg'),
  'accessoires': require('@/assets/images/categories/accessoires.jpg'),
};

/**
 * Get the image source for a category
 * @param imagePath - The imagePath from category config (e.g., 'categories/robes.jpg')
 * @returns React Native image source
 */
export const getCategoryImage = (imagePath: string) => {
  // Extract category ID from path (e.g., 'categories/robes.jpg' -> 'robes')
  const categoryId = imagePath.split('/').pop()?.replace('.jpg', '') || '';
  return CATEGORY_IMAGES[categoryId];
};

/**
 * Get all category images
 */
export const getAllCategoryImages = () => CATEGORY_IMAGES;
