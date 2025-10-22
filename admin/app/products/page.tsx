'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Category {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  quantity: number;
  location: string;
}

interface Variant {
  id: string;
  sku: string;
  price: number;
  attributes: Record<string, string>;
  inventory_items?: InventoryItem[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  created_at: string;
  variants?: Variant[];
  product_categories?: {
    category_id: string;
    categories: Category;
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category_id: '',
    variants: [
      {
        sku: '',
        price: '',
        attributes: { size: '', color: '' },
        inventory: [{ quantity: '', location: 'Default Location' }],
      },
    ],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category_id: formData.category_id || undefined,
        variants: formData.variants.map((v) => ({
          sku: v.sku,
          price: parseFloat(v.price),
          attributes: v.attributes,
          inventory: v.inventory.map((i) => ({
            quantity: parseInt(i.quantity),
            location: i.location,
          })),
        })),
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      alert('Product created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        brand: '',
        category_id: '',
        variants: [
          {
            sku: '',
            price: '',
            attributes: { size: '', color: '' },
            inventory: [{ quantity: '', location: 'Default Location' }],
          },
        ],
      });
      fetchProducts();
    } catch (error: any) {
      alert(`Error creating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function addVariant() {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: '',
          price: '',
          attributes: { size: '', color: '' },
          inventory: [{ quantity: '', location: 'Default Location' }],
        },
      ],
    });
  }

  function removeVariant(index: number) {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  }

  function updateVariant(index: number, field: string, value: any) {
    const newVariants = [...formData.variants];
    if (field === 'size' || field === 'color') {
      newVariants[index].attributes[field] = value;
    } else if (field === 'quantity' || field === 'location') {
      newVariants[index].inventory[0][field] = value;
    } else {
      (newVariants[index] as any)[field] = value;
    }
    setFormData({ ...formData, variants: newVariants });
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Products</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Product'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create New Product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    + Add Variant
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          SKU *
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Size
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          value={variant.inventory[0].quantity}
                          onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={variant.inventory[0].location}
                          onChange={(e) => updateVariant(index, 'location', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2">Brand: {product.brand}</p>
              )}
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}

              {product.product_categories && product.product_categories.length > 0 && (
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {product.product_categories[0].categories.name}
                  </span>
                </div>
              )}

              {product.variants && product.variants.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Variants ({product.variants.length})
                  </p>
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="text-xs text-gray-600 mb-1">
                      <span className="font-mono">{variant.sku}</span> - ${variant.price}
                      {variant.attributes && (
                        <span className="ml-2 text-gray-500">
                          {Object.entries(variant.attributes)
                            .filter(([_, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      )}
                      {variant.inventory_items &&
                        variant.inventory_items.length > 0 && (
                          <span className="ml-2 text-green-600">
                            Stock: {variant.inventory_items[0].quantity}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Created: {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              No products found. Create your first product to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
