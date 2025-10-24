import { create } from 'zustand';
import { getCategoriesByBusinessType, CategoryConfig } from '@shared/constants';

// Category now comes from static constants, not API
export interface Category extends CategoryConfig {
  // All fields come from CategoryConfig: id, name, description, imagePath, tag
}

interface CategoryStore {
  categories: Category[];
  selectedBusinessType: string | null;

  // Actions
  setBusinessType: (businessType: string) => void;
  getCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  selectedBusinessType: null,

  setBusinessType: (businessType: string) => {
    const categories = getCategoriesByBusinessType(businessType);
    set({ selectedBusinessType: businessType, categories });
  },

  getCategories: () => {
    return get().categories;
  },

  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },
}));
