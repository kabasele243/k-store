import { VariantService, CreateVariantRequest, UpdateVariantRequest } from '../../src/services/variantService';
import { IVariantRepository } from '../../src/repositories/IVariantRepository';
import { ApiError } from '../../src/libs/errorHandler';

describe('VariantService', () => {
  let variantService: VariantService;
  let mockRepository: jest.Mocked<IVariantRepository>;

  beforeEach(() => {
    mockRepository = {
      productExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateInventoryQuantity: jest.fn(),
      findByIdWithInventory: jest.fn()
    } as any;
    variantService = new VariantService(mockRepository);
  });

  describe('createVariant', () => {
    it('should throw 400 when product_id is missing', async () => {
      const request: CreateVariantRequest = {
        product_id: '',
        sku: 'SKU-001'
      };

      await expect(variantService.createVariant(request)).rejects.toThrow(
        new ApiError(400, 'Product ID is required')
      );

      expect(mockRepository.productExists).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw 400 when SKU is missing', async () => {
      const request: CreateVariantRequest = {
        product_id: 'p1',
        sku: ''
      };

      await expect(variantService.createVariant(request)).rejects.toThrow(
        new ApiError(400, 'SKU is required')
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw 404 when product does not exist', async () => {
      const request: CreateVariantRequest = {
        product_id: 'non-existent',
        sku: 'SKU-001'
      };
      mockRepository.productExists.mockResolvedValue(false);

      await expect(variantService.createVariant(request)).rejects.toThrow(
        new ApiError(404, 'Product not found')
      );

      expect(mockRepository.productExists).toHaveBeenCalledWith('non-existent');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create variant with all fields', async () => {
      const request: CreateVariantRequest = {
        product_id: 'p1',
        sku: 'SKU-001',
        price: 29.99,
        attributes: { size: 'M', color: 'Blue' }
      };
      const mockVariant = {
        id: 'v1',
        product_id: 'p1',
        sku: 'SKU-001',
        price: 29.99,
        attributes: { size: 'M', color: 'Blue' },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      mockRepository.productExists.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(mockVariant);

      const result = await variantService.createVariant(request);

      expect(mockRepository.productExists).toHaveBeenCalledWith('p1');
      expect(mockRepository.create).toHaveBeenCalledWith(request);
      expect(result).toEqual({ variant: mockVariant });
    });

    it('should create variant with optional price and attributes', async () => {
      const request: CreateVariantRequest = {
        product_id: 'p1',
        sku: 'SKU-002'
      };
      const mockVariant = {
        id: 'v2',
        product_id: 'p1',
        sku: 'SKU-002',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      mockRepository.productExists.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(mockVariant);

      const result = await variantService.createVariant(request);

      expect(result).toEqual({ variant: mockVariant });
      expect(mockRepository.create).toHaveBeenCalledWith(request);
    });
  });

  describe('updateVariant', () => {
    const validVariantId = 'v1';

    it('should throw 400 when variant_id is missing', async () => {
      const request: UpdateVariantRequest = { price: 39.99 };

      await expect(variantService.updateVariant('', request)).rejects.toThrow(
        new ApiError(400, 'Variant ID is required')
      );

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw 400 when no fields to update', async () => {
      const request: UpdateVariantRequest = {};

      await expect(variantService.updateVariant(validVariantId, request)).rejects.toThrow(
        new ApiError(400, 'At least one field to update is required')
      );

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update price, SKU, and attributes', async () => {
      const request: UpdateVariantRequest = {
        price: 39.99,
        sku: 'SKU-UPDATED',
        attributes: { size: 'L', color: 'Red' }
      };
      const mockVariant = {
        id: validVariantId,
        product_id: 'p1',
        price: 39.99,
        sku: 'SKU-UPDATED',
        attributes: { size: 'L', color: 'Red' },
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(mockRepository.update).toHaveBeenCalledWith(validVariantId, {
        price: 39.99,
        sku: 'SKU-UPDATED',
        attributes: { size: 'L', color: 'Red' }
      });
      expect(result).toEqual({ variant: mockVariant });
    });

    it('should update inventory quantity separately', async () => {
      const request: UpdateVariantRequest = {
        inventory_id: 'inv-1',
        quantity: 100
      };
      const mockVariant: any = {
        id: validVariantId,
        product_id: 'p1',
        sku: 'SKU-001',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        inventory: [{ id: 'inv-1', quantity: 100 }]
      };
      mockRepository.updateInventoryQuantity.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.updateInventoryQuantity).toHaveBeenCalledWith(
        validVariantId,
        'inv-1',
        100
      );
      expect(result).toEqual({ variant: mockVariant });
    });

    it('should update both variant and inventory together', async () => {
      const request: UpdateVariantRequest = {
        price: 49.99,
        sku: 'SKU-NEW',
        inventory_id: 'inv-1',
        quantity: 50
      };
      const mockVariant: any = {
        id: validVariantId,
        product_id: 'p1',
        price: 49.99,
        sku: 'SKU-NEW',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        inventory: [{ id: 'inv-1', quantity: 50 }]
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.updateInventoryQuantity.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(mockRepository.update).toHaveBeenCalledWith(validVariantId, {
        price: 49.99,
        sku: 'SKU-NEW',
        attributes: undefined
      });
      expect(mockRepository.updateInventoryQuantity).toHaveBeenCalledWith(
        validVariantId,
        'inv-1',
        50
      );
      expect(result).toEqual({ variant: mockVariant });
    });

    it('should throw 404 when variant not found after update', async () => {
      const request: UpdateVariantRequest = { price: 29.99 };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(null);

      await expect(
        variantService.updateVariant(validVariantId, request)
      ).rejects.toThrow(new ApiError(404, 'Variant not found'));

      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockRepository.findByIdWithInventory).toHaveBeenCalledWith(validVariantId);
    });

    it('should return updated variant with inventory', async () => {
      const request: UpdateVariantRequest = { price: 59.99 };
      const mockVariant: any = {
        id: validVariantId,
        product_id: 'p1',
        price: 59.99,
        sku: 'SKU-001',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        inventory: [
          { id: 'inv-1', quantity: 100, location: 'Warehouse A' },
          { id: 'inv-2', quantity: 50, location: 'Warehouse B' }
        ]
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(result.variant).toEqual(mockVariant);
      expect((result.variant as any).inventory).toBeDefined();
      expect((result.variant as any).inventory).toHaveLength(2);
    });

    it('should allow price to be set to 0', async () => {
      const request: UpdateVariantRequest = { price: 0 };
      const mockVariant = {
        id: validVariantId,
        product_id: 'p1',
        sku: 'SKU-001',
        price: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(mockRepository.update).toHaveBeenCalledWith(validVariantId, {
        price: 0,
        sku: undefined,
        attributes: undefined
      });
      expect(result.variant.price).toBe(0);
    });

    it('should allow quantity to be set to 0', async () => {
      const request: UpdateVariantRequest = {
        inventory_id: 'inv-1',
        quantity: 0
      };
      const mockVariant: any = {
        id: validVariantId,
        product_id: 'p1',
        sku: 'SKU-001',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        inventory: [{ id: 'inv-1', quantity: 0 }]
      };
      mockRepository.updateInventoryQuantity.mockResolvedValue(undefined);
      mockRepository.findByIdWithInventory.mockResolvedValue(mockVariant);

      const result = await variantService.updateVariant(validVariantId, request);

      expect(mockRepository.updateInventoryQuantity).toHaveBeenCalledWith(
        validVariantId,
        'inv-1',
        0
      );
      expect((result.variant as any).inventory[0].quantity).toBe(0);
    });
  });
});
