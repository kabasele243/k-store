'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface BusinessType {
  id: string;
  name: string;
  description: string;
}

interface Business {
  id: string;
  name: string;
  business_types?: BusinessType;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  business_type_id: string | null;
  business_id: string | null;
  is_admin: boolean;
  role: 'admin' | 'manager' | 'agent';
  business_types: BusinessType | null;
  businesses: Business | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  profile: UserProfile | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_id: '',
    role: 'agent' as 'admin' | 'manager' | 'agent',
  });

  useEffect(() => {
    fetchUsers();
    fetchBusinesses();
  }, []);

  async function fetchUsers() {
    try {
      // Get all users from auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      // Get all user profiles with businesses
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          businesses (
            id,
            name,
            business_types (
              id,
              name,
              description
            )
          )
        `);

      if (profileError) throw profileError;

      // Merge auth users with their profiles
      const mergedUsers = authUsers.map((authUser) => {
        const profile = profiles?.find((p) => p.id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || '',
          created_at: authUser.created_at,
          profile,
        };
      });

      setUsers(mergedUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

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
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    // Validate business requirement
    if (formData.role !== 'admin' && !formData.business_id) {
      alert('Business is required for non-admin users');
      return;
    }

    setLoading(true);

    try {
      // Get business details if business_id is provided
      let businessName = null;
      if (formData.business_id) {
        const business = businesses.find(b => b.id === formData.business_id);
        businessName = business?.name || null;
      }

      // Create user via Supabase Auth Admin with metadata
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          role: formData.role,
          business_id: formData.business_id || null,
          business_name: businessName,
          is_admin: formData.role === 'admin',
        },
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.full_name,
          business_id: formData.business_id || null,
          role: formData.role,
          is_admin: formData.role === 'admin',
        });

      if (profileError) {
        // Rollback: delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      alert('User created successfully');
      setShowCreateForm(false);
      setFormData({ email: '', password: '', full_name: '', business_id: '', role: 'agent' });
      fetchUsers();
    } catch (error: any) {
      alert(`Error creating user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && users.length === 0) {
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
            <h1 className="text-4xl font-bold text-gray-900">Users</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'agent' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="agent">Agent (Read-only)</option>
                  <option value="manager">Manager (Can update store)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Admin: Full access | Manager: Update own store | Agent: Read-only
                </p>
              </div>

              {formData.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business *
                  </label>
                  <select
                    required={formData.role !== 'admin'}
                    value={formData.business_id}
                    onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name} ({business.business_types?.name || 'Unknown'})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Required for managers and agents
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.profile?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.profile?.businesses?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.profile?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.profile?.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.profile?.role ? user.profile.role.charAt(0).toUpperCase() + user.profile.role.slice(1) : 'Agent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found. Create your first user to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
