import { getSupabaseClient } from '../libs/supabaseClient';
import { ApiError } from '../libs/errorHandler';

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export const getBusinessById = async (businessId: string) => {
  if (!businessId) {
    throw new ApiError(400, 'Business ID is required');
  }

  const supabase = getSupabaseClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*, business_types(id, name, description)')
    .eq('id', businessId)
    .single();

  if (error || !business) {
    throw new ApiError(404, 'Business not found');
  }

  return business;
};

export const getBusinesses = async (businessTypeId?: string) => {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('businesses')
    .select('*, business_types(id, name, description)')
    .order('name', { ascending: true });

  // Filter by business type if provided
  if (businessTypeId) {
    query = query.eq('business_type_id', businessTypeId);
  }

  const { data: businesses, error } = await query;

  if (error) throw error;

  return businesses;
};

export const updateBusiness = async (
  businessId: string,
  data: UpdateBusinessRequest
) => {
  if (!businessId) {
    throw new ApiError(400, 'Business ID is required');
  }

  const supabase = getSupabaseClient();

  // Verify business exists
  const { data: existingBusiness, error: fetchError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .single();

  if (fetchError || !existingBusiness) {
    throw new ApiError(404, 'Business not found');
  }

  // Update the business
  const { data: business, error } = await supabase
    .from('businesses')
    .update({
      name: data.name,
      description: data.description,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country: data.country,
    })
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw error;

  return business;
};

export const deleteBusiness = async (businessId: string) => {
  if (!businessId) {
    throw new ApiError(400, 'Business ID is required');
  }

  const supabase = getSupabaseClient();

  // Check if business has users
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('business_id', businessId)
    .limit(1);

  if (usersError) throw usersError;

  if (users && users.length > 0) {
    throw new ApiError(
      400,
      'Cannot delete business with assigned users. Please reassign or remove users first.'
    );
  }

  // Delete the business
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) throw error;

  return { message: 'Business deleted successfully' };
};
