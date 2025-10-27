import { ApiError } from '../libs/errorHandler';
import { IBusinessRepository } from '../repositories/IBusinessRepository';

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export class BusinessService {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  async getBusinessById(businessId: string) {
    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(404, 'Business not found');
    }

    return business;
  }

  async getBusinesses(businessTypeId?: string) {
    return await this.businessRepository.findAll(businessTypeId);
  }

  async updateBusiness(businessId: string, data: UpdateBusinessRequest) {
    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    // Verify business exists
    const exists = await this.businessRepository.exists(businessId);
    if (!exists) {
      throw new ApiError(404, 'Business not found');
    }

    return await this.businessRepository.update(businessId, data);
  }

  async deleteBusiness(businessId: string) {
    if (!businessId) {
      throw new ApiError(400, 'Business ID is required');
    }

    // Check if business has users
    const hasUsers = await this.businessRepository.hasUsers(businessId);
    if (hasUsers) {
      throw new ApiError(
        400,
        'Cannot delete business with assigned users. Please reassign or remove users first.'
      );
    }

    await this.businessRepository.delete(businessId);
    return { message: 'Business deleted successfully' };
  }
}
