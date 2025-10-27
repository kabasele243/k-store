import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUsers } from '../../services/users/userService';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await getUsers();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
    };
  }
};
