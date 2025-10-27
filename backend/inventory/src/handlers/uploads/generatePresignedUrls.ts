import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  handleError,
  createSuccessResponse,
  ApiError,
} from '../../libs/errorHandler';
import { UploadService } from '../../services/uploadService';
import { SupabaseUploadRepository } from '../../infrastructure/supabase/SupabaseUploadRepository';
import { getSupabaseClient } from '../../libs/supabaseClient';

const supabase = getSupabaseClient();
const uploadRepository = new SupabaseUploadRepository(supabase);
const uploadService = new UploadService(uploadRepository);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      throw new ApiError(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const result = await uploadService.generatePresignedUrls(requestBody);
    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error in generatePresignedUrls:', error);
    console.error('Request body:', event.body);
    return handleError(error);
  }
};
