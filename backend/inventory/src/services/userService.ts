import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const getUsers = async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Get all users from auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    throw new Error(authError.message);
  }

  // Get all user profiles
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

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Merge auth users with their profiles
  const users = authUsers.users.map((authUser) => {
    const profile = profiles?.find((p) => p.id === authUser.id);
    return {
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at,
      profile,
    };
  });

  return { users };
};
