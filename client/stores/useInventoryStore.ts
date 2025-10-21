import { create } from 'zustand';

interface InventoryItem {
  id: string;
  variant_id: string;
  quantity: number;
  location?: string;
  variant?: {
    id: string;
    sku: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

interface StockMovement {
  id: string;
  variant_id: string;
  quantity_change: number;
  reason: string;
  user_id: string;
  created_at: string;
}

interface InventoryStore {
  lowStockItems: InventoryItem[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchLowStock: (token: string, threshold?: number) => Promise<void>;
  addStock: (
    token: string,
    variantId: string,
    quantity: number,
    location?: string,
    reason?: string
  ) => Promise<void>;
  removeStock: (
    token: string,
    variantId: string,
    quantity: number,
    location?: string,
    reason?: string
  ) => Promise<void>;
  clearError: () => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  lowStockItems: [],
  loading: false,
  error: null,

  fetchLowStock: async (token: string, threshold = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_URL}/inventory/low-stock?threshold=${threshold}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }

      const data = await response.json();
      set({ lowStockItems: data.items || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addStock: async (
    token: string,
    variantId: string,
    quantity: number,
    location = 'Default',
    reason = 'new_shipment'
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/inventory/add-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity,
          location,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add stock');
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeStock: async (
    token: string,
    variantId: string,
    quantity: number,
    location = 'Default',
    reason = 'customer_sale'
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/inventory/remove-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity,
          location,
          reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove stock');
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
