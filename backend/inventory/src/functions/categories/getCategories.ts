import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getSupabaseClient } from '../../libs/supabaseClient';
import { handleError, createSuccessResponse } from '../../libs/errorHandler';
import { Category, CategoryWithChildren } from '../../libs/types';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const supabase = getSupabaseClient();
    const businessTypeId = event.queryStringParameters?.business_type_id;
    const includeHierarchy = event.queryStringParameters?.hierarchy === 'true';

    let query = supabase.from('categories').select('*');

    // Filter by business type if provided
    if (businessTypeId) {
      query = query.eq('business_type_id', businessTypeId);
    }

    query = query.order('name', { ascending: true });

    const { data: categories, error } = await query;

    if (error) throw error;

    // If hierarchy is requested, build the tree structure
    if (includeHierarchy && categories) {
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // First pass: create map of all categories
      categories.forEach((cat: Category) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Second pass: build hierarchy
      categories.forEach((cat: Category) => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_category_id) {
          const parent = categoryMap.get(cat.parent_category_id);
          if (parent) {
            parent.children!.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      return createSuccessResponse(rootCategories);
    }

    return createSuccessResponse(categories);
  } catch (error) {
    return handleError(error);
  }
};
