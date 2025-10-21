import { APIGatewayProxyResultV2 } from 'aws-lambda';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createErrorResponse = (
  statusCode: number,
  message: string,
  details?: any
): APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
  };
};

export const createSuccessResponse = (
  data: any,
  statusCode: number = 200
): APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
};

export const handleError = (error: any): APIGatewayProxyResultV2 => {
  console.error('Error:', error);

  if (error instanceof ApiError) {
    return createErrorResponse(error.statusCode, error.message, error.details);
  }

  // Supabase/PostgreSQL errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return createErrorResponse(409, 'Resource already exists', {
          code: error.code,
          detail: error.detail,
        });
      case '23503': // Foreign key violation
        return createErrorResponse(400, 'Invalid reference', {
          code: error.code,
          detail: error.detail,
        });
      case '23502': // Not null violation
        return createErrorResponse(400, 'Missing required field', {
          code: error.code,
          detail: error.detail,
        });
      default:
        return createErrorResponse(500, 'Database error', {
          code: error.code,
        });
    }
  }

  // Default error
  return createErrorResponse(500, 'Internal server error');
};
