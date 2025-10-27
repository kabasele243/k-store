import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../../libs/errorHandler';
import {
  IBusinessRepository,
  Business,
  UpdateBusinessData,
} from '../../repositories/IBusinessRepository';

export class SupabaseBusinessRepository implements IBusinessRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(businessId: string): Promise<Business | null> {
    const { data: business, error } = await this.supabase
      .from('businesses')
      .select('*, business_types(id, name, description)')
      .eq('id', businessId)
      .single();

    if (error || !business) {
      return null;
    }

    return business;
  }

  async findAll(businessTypeId?: string): Promise<Business[]> {
    let query = this.supabase
      .from('businesses')
      .select('*, business_types(id, name, description)')
      .order('name', { ascending: true });

    if (businessTypeId) {
      query = query.eq('business_type_id', businessTypeId);
    }

    const { data: businesses, error } = await query;

    if (error) throw error;

    return businesses || [];
  }

  async update(businessId: string, data: UpdateBusinessData): Promise<Business> {
    const { data: business, error } = await this.supabase
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
  }

  async exists(businessId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .single();

    return !error && !!data;
  }

  async hasUsers(businessId: string): Promise<boolean> {
    const { data: users, error } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('business_id', businessId)
      .limit(1);

    if (error) throw error;

    return users !== null && users.length > 0;
  }

  async delete(businessId: string): Promise<void> {
    const { error } = await this.supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
  }
}
