'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BusinessType {
  id: string;
  name: string;
}

interface Category {
  id: string;
  business_type_id: string;
  parent_category_id: string | null;
  name: string;
  description: string;
  created_at: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [formData, setFormData] = useState({
    business_type_id: '',
    parent_category_id: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    if (selectedBusinessType) {
      fetchCategories(selectedBusinessType);
    }
  }, [selectedBusinessType]);

  async function fetchBusinessTypes() {
    try {
      const response = await fetch(`${API_URL}/business-types`);
      const data = await response.json();
      setBusinessTypes(data.business_types || []);
      if (data.business_types?.length > 0) {
        setSelectedBusinessType(data.business_types[0].id);
        setFormData({ ...formData, business_type_id: data.business_types[0].id });
      }
    } catch (error) {
      console.error('Error fetching business types:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories(businessTypeId: string) {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/categories?business_type_id=${businessTypeId}&hierarchy=true`
      );
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      alert('Category created successfully');
      setShowCreateForm(false);
      setFormData({
        business_type_id: selectedBusinessType,
        parent_category_id: '',
        name: '',
        description: '',
      });
      fetchCategories(selectedBusinessType);
    } catch (error: any) {
      alert(`Error creating category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function renderCategoryTree(categories: Category[], level = 0) {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 24}px` }}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {level > 0 && '└─ '}
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {level === 0 ? 'Root' : 'Subcategory'}
            </span>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  }

  function getAllCategories(categories: Category[]): Category[] {
    const result: Category[] = [];
    categories.forEach((cat) => {
      result.push(cat);
      if (cat.children) {
        result.push(...getAllCategories(cat.children));
      }
    });
    return result;
  }

  if (loading && categories.length === 0 && businessTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const flatCategories = getAllCategories(categories);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Category'}
          </button>
        </div>

        {businessTypes.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Business Type
            </label>
            <select
              value={selectedBusinessType}
              onChange={(e) => setSelectedBusinessType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {businessTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  required
                  value={formData.business_type_id}
                  onChange={(e) =>
                    setFormData({ ...formData, business_type_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a business type</option>
                  {businessTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parent_category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None (Root Category)</option>
                  {flatCategories
                    .filter((cat) => cat.business_type_id === formData.business_type_id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Men's Clothing, Appetizers"
                />
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
                  placeholder="Brief description of this category"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {categories.length > 0 ? (
            renderCategoryTree(categories)
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                No categories found for this business type. Create your first category to get
                started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
