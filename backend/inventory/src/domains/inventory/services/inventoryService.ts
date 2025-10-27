import { getSupabaseClient } from '../../../libs/supabaseClient';
import { ApiError } from '../../../libs/errorHandler';

interface RecordSalesRequest {
  variant_id: string;
  quantity: number;
}

interface RecordSaleRequest {
  variant_id: string;
}

export const recordSales = async (request: RecordSalesRequest) => {
  // Validate required fields
  if (!request.variant_id) {
    throw new ApiError(400, 'Variant ID is required');
  }
  if (!request.quantity || request.quantity <= 0) {
    throw new ApiError(400, 'Quantity must be greater than 0');
  }

  const supabase = getSupabaseClient();

  // Verify variant exists
  const { data: variant, error: variantError } = await supabase
    .from('variants')
    .select('id')
    .eq('id', request.variant_id)
    .single();

  if (variantError || !variant) {
    throw new ApiError(404, 'Variant not found');
  }

  // Create multiple sale records
  const salesToInsert = Array.from({ length: request.quantity }, () => ({
    variant_id: request.variant_id,
  }));

  const { data: sales, error } = await supabase
    .from('sales')
    .insert(salesToInsert)
    .select();

  if (error) throw error;

  return {
    message: `Recorded ${request.quantity} sales`,
    sales_recorded: sales?.length || 0,
    sales,
  };
};

export const recordSale = async (request: RecordSaleRequest) => {
  // Validate required fields
  if (!request.variant_id) {
    throw new ApiError(400, 'Variant ID is required');
  }

  const supabase = getSupabaseClient();

  // Verify variant exists
  const { error: variantError } = await supabase
    .from('variants')
    .select('id')
    .eq('id', request.variant_id)
    .single();

  if (variantError) {
    if (variantError.code === 'PGRST116') {
      throw new ApiError(404, 'Variant not found');
    }
    throw variantError;
  }

  // Record the sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      variant_id: request.variant_id,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  return {
    message: 'Sale recorded successfully',
    sale,
  };
};

export const getLowStock = async () => {
  const supabase = getSupabaseClient();

  // Get sales count per variant
  const { data: salesCounts, error } = await supabase
    .rpc('get_sales_count_per_variant');

  if (error) {
    throw error;
  }

  return {
    count: salesCounts?.length || 0,
    variants: salesCounts || [],
  };
};
