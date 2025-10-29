import { ApiError } from '../libs/errorHandler';
import { ISalesRepository } from '../repositories/ISalesRepository';

interface RecordSalesRequest {
  variant_id: string;
  quantity: number;
}

interface RecordSaleRequest {
  variant_id: string;
}

export class SalesService {
  constructor(private readonly salesRepository: ISalesRepository) {}

  async recordSales(request: RecordSalesRequest) {
    if (!request.variant_id) {
      throw new ApiError(400, 'Variant ID is required');
    }
    if (!request.quantity || request.quantity <= 0) {
      throw new ApiError(400, 'Quantity must be greater than 0');
    }

    const exists = await this.salesRepository.variantExists(request.variant_id);
    if (!exists) {
      throw new ApiError(404, 'Variant not found');
    }

    const sales = await this.salesRepository.recordSales(request.variant_id, request.quantity);

    return {
      message: `Recorded ${request.quantity} sales`,
      sales_recorded: sales.length,
      sales,
    };
  }

  async recordSale(request: RecordSaleRequest) {
    if (!request.variant_id) {
      throw new ApiError(400, 'Variant ID is required');
    }

    const exists = await this.salesRepository.variantExists(request.variant_id);
    if (!exists) {
      throw new ApiError(404, 'Variant not found');
    }

    const sale = await this.salesRepository.recordSale(request.variant_id);

    return {
      message: 'Sale recorded successfully',
      sale,
    };
  }

  async getSalesReport() {
    const salesCounts = await this.salesRepository.getSalesCountPerVariant();
    return {
      count: salesCounts.length,
      variants: salesCounts,
    };
  }
}
