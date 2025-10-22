import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../libs/errorHandler';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = getSupabaseClient();

    const { data: businessTypes, error } = await supabase
      .from('business_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return createSuccessResponse(businessTypes);
  } catch (error) {
    return handleError(error);
  }
};
