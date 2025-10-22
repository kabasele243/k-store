import { create } from 'zustand';
import { apiFetch } from '@/utils/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  business_type_id?: string;
  created_at: string;
  updated_at?: string;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<Category[]>('/categories', { token });
      set({ categories: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
