import { create } from 'zustand';
import { apiFetch } from '@/utils/api';

interface Variant {
  id: string;
  sku: string;
  price?: number;
  inventory?: Array<{
    quantity: number;
    location?: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  created_at: string;
  variants?: Variant[];
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (token: string) => Promise<void>;
  addProduct: (token: string, product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (token: string, id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (token: string, id: string) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<{ products: Product[] }>('/products', { token });
      set({ products: data.products || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (token: string, product) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<{ product: Product }>('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
        body: JSON.stringify(product),
      });
      set((state) => ({
        products: [...state.products, data.product],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProduct: async (token: string, id: string, updates) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<{ product: Product }>(`/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
        body: JSON.stringify(updates),
      });
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...data.product } : p
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProduct: async (token: string, id: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/products/${id}`, {
        method: 'DELETE',
        token,
      });
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
