'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BusinessType {
  id: string;
  name: string;
  description?: string;
}

interface Business {
  id: string;
  name: string;
  business_type_id: string;
  description?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  business_types?: BusinessType;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    business_type_id: '',
    description: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    fetchBusinesses();
    fetchBusinessTypes();
  }, []);

  async function fetchBusinesses() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            description
          )
        `)
        .order('name');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBusinessTypes() {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setBusinessTypes(data || []);
    } catch (error) {
      console.error('Error fetching business types:', error);
    }
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          business_type_id: formData.business_type_id,
          description: formData.description || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address_line1: formData.address_line1 || null,
          address_line2: formData.address_line2 || null,
          city: formData.city || null,
          state_province: formData.state_province || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
        })
        .select()
        .single();

      if (error) throw error;

      alert('Business created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchBusinesses();
    } catch (error: any) {
      alert(`Error creating business: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBusiness) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          description: formData.description || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address_line1: formData.address_line1 || null,
          address_line2: formData.address_line2 || null,
          city: formData.city || null,
          state_province: formData.state_province || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
        })
        .eq('id', editingBusiness.id)
        .select()
        .single();

      if (error) throw error;

      alert('Business updated successfully');
      setShowEditForm(false);
      setEditingBusiness(null);
      resetForm();
      fetchBusinesses();
    } catch (error: any) {
      alert(`Error updating business: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBusiness(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Business deleted successfully');
      fetchBusinesses();
    } catch (error: any) {
      alert(`Error deleting business: ${error.message}`);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      business_type_id: '',
      description: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
    });
  }

  function startEdit(business: Business) {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      business_type_id: business.business_type_id,
      description: business.description || '',
      email: business.email || '',
      phone: business.phone || '',
      address_line1: business.address_line1 || '',
      address_line2: business.address_line2 || '',
      city: business.city || '',
      state_province: business.state_province || '',
      postal_code: business.postal_code || '',
      country: business.country || '',
    });
    setShowEditForm(true);
  }

  if (loading && businesses.length === 0) {
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
            <h1 className="text-4xl font-bold text-gray-900">Businesses</h1>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
              resetForm();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Business'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create New Business</h2>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    required
                    value={formData.business_type_id}
                    onChange={(e) => setFormData({ ...formData, business_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a business type</option>
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province/Region
                  </label>
                  <input
                    type="text"
                    value={formData.state_province}
                    onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="England"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a country</option>
                    <option value="Democratic Republic of Congo">Democratic Republic of Congo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Business'}
              </button>
            </form>
          </div>
        )}

        {showEditForm && editingBusiness && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Edit Business</h2>
            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
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
                    Business Type
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingBusiness.business_types?.name || 'Unknown'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Business type cannot be changed</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province/Region
                  </label>
                  <input
                    type="text"
                    value={formData.state_province}
                    onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a country</option>
                    <option value="Democratic Republic of Congo">Democratic Republic of Congo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update Business'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingBusiness(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {business.name}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {business.business_types?.name || 'Unknown'}
                </span>
              </div>

              {business.description && (
                <p className="text-gray-600 mb-3 text-sm">{business.description}</p>
              )}

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                {business.email && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span> {business.email}
                  </p>
                )}
                {business.phone && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span> {business.phone}
                  </p>
                )}
                {(business.address_line1 || business.city) && (
                  <p className="flex items-start gap-2">
                    <span className="font-medium">Address:</span>
                    <span>
                      {business.address_line1}
                      {business.address_line2 && <><br />{business.address_line2}</>}
                      {business.city && <><br />{business.city}</>}
                      {business.state_province && `, ${business.state_province}`}
                      {business.postal_code && ` ${business.postal_code}`}
                      {business.country && <><br />{business.country}</>}
                    </span>
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Created: {new Date(business.created_at).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(business)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBusiness(business.id, business.name)}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              No businesses found. Create your first business to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
