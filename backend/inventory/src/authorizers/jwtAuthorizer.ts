import {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWTPayload, AuthorizerContext } from '../libs/types';

export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthorizerContext>> => {
  try {
    // Extract token from Authorization header
    const token = event.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      console.error('No token provided');
      return {
        isAuthorized: false,
        context: {} as AuthorizerContext,
      };
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return {
        isAuthorized: false,
        context: {} as AuthorizerContext,
      };
    }

    // Verify and decode the JWT
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Extract user information
    const userId = decoded.sub;
    if (!userId) {
      console.error('No user ID in token');
      return {
        isAuthorized: false,
        context: {} as AuthorizerContext,
      };
    }

    // Return authorization result with user context
    return {
      isAuthorized: true,
      context: {
        userId,
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      isAuthorized: false,
      context: {} as AuthorizerContext,
    };
  }
};
