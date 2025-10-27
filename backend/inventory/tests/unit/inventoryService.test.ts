import { InventoryService } from '../../src/services/inventoryService';
import { IInventoryRepository, Sale } from '../../src/repositories/IInventoryRepository';
import { ApiError } from '../../src/libs/errorHandler';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockRepository: jest.Mocked<IInventoryRepository>;

  beforeEach(() => {
    mockRepository = {
      variantExists: jest.fn(),
      recordSales: jest.fn(),
      recordSale: jest.fn(),
      getSalesCountPerVariant: jest.fn()
    };
    inventoryService = new InventoryService(mockRepository);
  });

  describe('recordSales', () => {
    it('should throw 400 when variant_id is missing', async () => {
      await expect(
        inventoryService.recordSales({ variant_id: '', quantity: 5 })
      ).rejects.toThrow(new ApiError(400, 'Variant ID is required'));

      expect(mockRepository.variantExists).not.toHaveBeenCalled();
      expect(mockRepository.recordSales).not.toHaveBeenCalled();
    });

    it('should throw 400 when quantity is missing', async () => {
      await expect(
        inventoryService.recordSales({ variant_id: 'v1', quantity: 0 } as any)
      ).rejects.toThrow(new ApiError(400, 'Quantity must be greater than 0'));

      expect(mockRepository.recordSales).not.toHaveBeenCalled();
    });

    it('should throw 400 when quantity is 0', async () => {
      await expect(
        inventoryService.recordSales({ variant_id: 'v1', quantity: 0 })
      ).rejects.toThrow(new ApiError(400, 'Quantity must be greater than 0'));
    });

    it('should throw 400 when quantity is negative', async () => {
      await expect(
        inventoryService.recordSales({ variant_id: 'v1', quantity: -5 })
      ).rejects.toThrow(new ApiError(400, 'Quantity must be greater than 0'));
    });

    it('should throw 404 when variant does not exist', async () => {
      mockRepository.variantExists.mockResolvedValue(false);

      await expect(
        inventoryService.recordSales({ variant_id: 'non-existent', quantity: 5 })
      ).rejects.toThrow(new ApiError(404, 'Variant not found'));

      expect(mockRepository.variantExists).toHaveBeenCalledWith('non-existent');
      expect(mockRepository.recordSales).not.toHaveBeenCalled();
    });

    it('should record multiple sales successfully', async () => {
      const mockSales: Sale[] = [
        { id: 's1', variant_id: 'v1', created_at: '2024-01-01' },
        { id: 's2', variant_id: 'v1', created_at: '2024-01-01' },
        { id: 's3', variant_id: 'v1', created_at: '2024-01-01' }
      ];
      mockRepository.variantExists.mockResolvedValue(true);
      mockRepository.recordSales.mockResolvedValue(mockSales);

      const result = await inventoryService.recordSales({
        variant_id: 'v1',
        quantity: 3
      });

      expect(mockRepository.variantExists).toHaveBeenCalledWith('v1');
      expect(mockRepository.recordSales).toHaveBeenCalledWith('v1', 3);
      expect(result).toEqual({
        message: 'Recorded 3 sales',
        sales_recorded: 3,
        sales: mockSales
      });
    });

    it('should return correct response format with sales count', async () => {
      const mockSales: Sale[] = Array.from({ length: 10 }, (_, i) => ({
        id: `s${i}`,
        variant_id: 'v1',
        created_at: '2024-01-01'
      }));
      mockRepository.variantExists.mockResolvedValue(true);
      mockRepository.recordSales.mockResolvedValue(mockSales);

      const result = await inventoryService.recordSales({
        variant_id: 'v1',
        quantity: 10
      });

      expect(result.message).toBe('Recorded 10 sales');
      expect(result.sales_recorded).toBe(10);
      expect(result.sales).toHaveLength(10);
      expect(result.sales).toEqual(mockSales);
    });
  });

  describe('recordSale', () => {
    it('should throw 400 when variant_id is missing', async () => {
      await expect(
        inventoryService.recordSale({ variant_id: '' })
      ).rejects.toThrow(new ApiError(400, 'Variant ID is required'));

      expect(mockRepository.variantExists).not.toHaveBeenCalled();
      expect(mockRepository.recordSale).not.toHaveBeenCalled();
    });

    it('should throw 404 when variant does not exist', async () => {
      mockRepository.variantExists.mockResolvedValue(false);

      await expect(
        inventoryService.recordSale({ variant_id: 'non-existent' })
      ).rejects.toThrow(new ApiError(404, 'Variant not found'));

      expect(mockRepository.variantExists).toHaveBeenCalledWith('non-existent');
      expect(mockRepository.recordSale).not.toHaveBeenCalled();
    });

    it('should record single sale successfully', async () => {
      const mockSale: Sale = {
        id: 's1',
        variant_id: 'v1',
        created_at: '2024-01-01'
      };
      mockRepository.variantExists.mockResolvedValue(true);
      mockRepository.recordSale.mockResolvedValue(mockSale);

      const result = await inventoryService.recordSale({ variant_id: 'v1' });

      expect(mockRepository.variantExists).toHaveBeenCalledWith('v1');
      expect(mockRepository.recordSale).toHaveBeenCalledWith('v1');
      expect(result).toEqual({
        message: 'Sale recorded successfully',
        sale: mockSale
      });
    });

    it('should return correct response format', async () => {
      const mockSale: Sale = {
        id: 'sale-123',
        variant_id: 'variant-456',
        created_at: '2024-01-15T10:30:00Z'
      };
      mockRepository.variantExists.mockResolvedValue(true);
      mockRepository.recordSale.mockResolvedValue(mockSale);

      const result = await inventoryService.recordSale({ variant_id: 'variant-456' });

      expect(result.message).toBe('Sale recorded successfully');
      expect(result.sale).toEqual(mockSale);
      expect(result.sale.id).toBe('sale-123');
      expect(result.sale.variant_id).toBe('variant-456');
    });
  });

  describe('getLowStock', () => {
    it('should return sales count per variant', async () => {
      const mockSalesCounts = [
        { variant_id: 'v1', sales_count: 10, variant_name: 'Variant 1' },
        { variant_id: 'v2', sales_count: 5, variant_name: 'Variant 2' },
        { variant_id: 'v3', sales_count: 15, variant_name: 'Variant 3' }
      ];
      mockRepository.getSalesCountPerVariant.mockResolvedValue(mockSalesCounts);

      const result = await inventoryService.getLowStock();

      expect(mockRepository.getSalesCountPerVariant).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        count: 3,
        variants: mockSalesCounts
      });
    });

    it('should return correct count in response', async () => {
      const mockSalesCounts = [
        { variant_id: 'v1', sales_count: 20 },
        { variant_id: 'v2', sales_count: 8 }
      ];
      mockRepository.getSalesCountPerVariant.mockResolvedValue(mockSalesCounts);

      const result = await inventoryService.getLowStock();

      expect(result.count).toBe(2);
      expect(result.variants).toHaveLength(2);
    });

    it('should return empty array when no sales exist', async () => {
      mockRepository.getSalesCountPerVariant.mockResolvedValue([]);

      const result = await inventoryService.getLowStock();

      expect(result.count).toBe(0);
      expect(result.variants).toEqual([]);
    });

    it('should return variants with correct structure', async () => {
      const mockSalesCounts = [
        {
          variant_id: 'v1',
          sales_count: 25,
          sku: 'SKU-001',
          product_name: 'Product 1'
        }
      ];
      mockRepository.getSalesCountPerVariant.mockResolvedValue(mockSalesCounts);

      const result = await inventoryService.getLowStock();

      expect(result.variants[0]).toHaveProperty('variant_id');
      expect(result.variants[0]).toHaveProperty('sales_count');
      expect(result.variants[0].sales_count).toBe(25);
    });
  });
});
