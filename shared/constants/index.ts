/**
 * Shared Constants Export
 * Central export point for all static configuration
 */

export {
  BUSINESS_TYPES,
  ALL_BUSINESS_TYPES,
  getBusinessTypeById,
  isValidBusinessTypeId,
  type BusinessTypeConfig,
  type BusinessTypeId,
} from './businessTypes';

export {
  CATEGORIES_BY_BUSINESS_TYPE,
  getAllCategories,
  getCategoriesByBusinessType,
  getCategoryById,
  isCategoryValidForBusinessType,
  getCategoryIdsByBusinessType,
  type CategoryConfig,
  type CategoryId,
} from './categories';
