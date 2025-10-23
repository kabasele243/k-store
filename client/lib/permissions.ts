import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'agent';

export interface UserWithRole extends User {
  user_metadata: {
    role?: UserRole;
    business_id?: string;
    business_name?: string;
    full_name?: string;
    [key: string]: any;
  };
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.role === 'admin';
}

/**
 * Check if user has manager role
 */
export function isManager(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.role === 'manager';
}

/**
 * Check if user has agent role (read-only)
 */
export function isAgent(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.role === 'agent';
}

/**
 * Check if user can update data
 * Admin can update everything, Manager can update their store
 */
export function canUpdate(user: User | null): boolean {
  if (!user) return false;
  const role = user.user_metadata?.role;
  return role === 'admin' || role === 'manager';
}

/**
 * Check if user can read data
 * All authenticated users can read
 */
export function canRead(user: User | null): boolean {
  return !!user;
}

/**
 * Check if user can manage users (create/edit/delete)
 * Only admins can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can access a specific business
 * Admin can access all, others only their assigned business
 */
export function canAccessBusiness(user: User | null, businessId: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.user_metadata?.business_id === businessId;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role?: UserRole): string {
  if (!role) return 'Agent';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return 'purple';
    case 'manager':
      return 'blue';
    case 'agent':
    default:
      return 'gray';
  }
}
