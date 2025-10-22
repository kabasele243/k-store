import { create } from 'zustand';

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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      set({ products: data.products || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (token: string, product) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
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
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json();
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
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

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
