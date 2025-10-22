import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { email, password, business_id, is_admin = false } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    if (!is_admin && !business_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Business ID is required for non-admin users' }),
      };
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: authError.message }),
      };
    }

    // Verify business exists if business_id is provided
    if (business_id) {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', business_id)
        .single();

      if (businessError || !business) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Business not found' }),
        };
      }
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        business_id,
        is_admin,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: profileError.message }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          profile: profileData,
        },
      }),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
