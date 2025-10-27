import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository, User } from '../../repositories/IUserRepository';

export class SupabaseUserRepository implements IUserRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseServiceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async findAllWithProfiles(): Promise<User[]> {
    // Get all users from auth
    const { data: authUsers, error: authError } = await this.supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(authError.message);
    }

    // Get all user profiles
    const { data: profiles, error: profileError } = await this.supabase
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

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Merge auth users with their profiles
    const users = authUsers.users.map((authUser) => {
      const profile = profiles?.find((p) => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email!,
        created_at: authUser.created_at,
        profile,
      };
    });

    return users;
  }
}
