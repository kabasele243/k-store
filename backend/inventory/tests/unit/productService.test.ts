import { ProductService } from '../../src/services/productService';
import { IProductRepository, Product, ProductImage } from '../../src/repositories/IProductRepository';
import { ApiError } from '../../src/libs/errorHandler';

describe('ProductService', () => {
  let productService: ProductService;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      getProductImages: jest.fn(),
      deleteProductImages: jest.fn(),
      insertProductImages: jest.fn()
    };
    productService = new ProductService(mockRepository);
  });

  describe('getProductById', () => {
    it('should throw 400 error when product ID is missing', async () => {
      await expect(productService.getProductById('')).rejects.toThrow(
        new ApiError(400, 'Product ID is required')
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw 404 error when product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById('non-existent-id')).rejects.toThrow(
        new ApiError(404, 'Product not found')
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should return product when valid ID provided', async () => {
      const mockProduct: Product = {
        id: '123',
        name: 'Test Product',
        description: 'Test Description',
        brand: 'Test Brand',
        category: 'Test Category',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        variants: []
      };
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('123');

      expect(result).toEqual({ product: mockProduct });
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should call repository.findById with correct ID', async () => {
      const mockProduct: Product = {
        id: 'test-id-456',
        name: 'Another Product',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      mockRepository.findById.mockResolvedValue(mockProduct);

      await productService.getProductById('test-id-456');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-id-456');
    });
  });

  describe('getProducts', () => {
    it('should return all products from repository', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Product 2',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];
      mockRepository.findAll.mockResolvedValue(mockProducts);

      const result = await productService.getProducts();

      expect(result).toEqual({ products: mockProducts });
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await productService.getProducts();

      expect(result).toEqual({ products: [] });
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should include variants and sales data in response', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          variants: [
            { id: 'v1', sku: 'SKU-001', price: 29.99 }
          ]
        }
      ];
      mockRepository.findAll.mockResolvedValue(mockProducts);

      const result = await productService.getProducts();

      expect(result.products[0].variants).toBeDefined();
      expect(result.products[0].variants).toHaveLength(1);
    });
  });

  describe('updateProduct', () => {

    const validProductId = 'product-123';

    it('should throw 400 when product ID is missing', async () => {
      await expect(
        productService.updateProduct('', { name: 'Test' })
      ).rejects.toThrow(new ApiError(400, 'Product ID is required'));

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw 400 when no update fields provided', async () => {
      await expect(
        productService.updateProduct(validProductId, {})
      ).rejects.toThrow(
        new ApiError(400, 'At least one field is required to update')
      );

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update product fields (name, description, brand, category)', async () => {
      const mockProduct: Product = {
        id: validProductId,
        name: 'Updated Name',
        description: 'Updated Description',
        brand: 'Updated Brand',
        category: 'Updated Category',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      mockRepository.update.mockResolvedValue(mockProduct);

      const result = await productService.updateProduct(validProductId, {
        name: 'Updated Name',
        description: 'Updated Description',
        brand: 'Updated Brand',
        category: 'Updated Category'
      });

      expect(mockRepository.update).toHaveBeenCalledWith(validProductId, {
        name: 'Updated Name',
        description: 'Updated Description',
        brand: 'Updated Brand',
        category: 'Updated Category'
      });
      expect(result).toEqual({ product: mockProduct });
    });

    it('should replace product images when provided', async () => {
      const mockProduct: Product = {
        id: validProductId,
        name: 'Test Product',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      const images: ProductImage[] = [
        { image_url: 'http://example.com/img1.jpg', is_primary: true },
        { image_url: 'http://example.com/img2.jpg', alt_text: 'Alt text' }
      ];

      mockRepository.update.mockResolvedValue(mockProduct);
      mockRepository.deleteProductImages.mockResolvedValue();
      mockRepository.insertProductImages.mockResolvedValue();

      const result = await productService.updateProduct(validProductId, {
        name: 'Test Product',
        images
      });

      expect(mockRepository.deleteProductImages).toHaveBeenCalledWith(validProductId);
      expect(mockRepository.insertProductImages).toHaveBeenCalledWith(validProductId, images);
      expect(mockRepository.deleteProductImages).toHaveBeenCalledTimes(1);
      expect(mockRepository.insertProductImages).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ product: mockProduct });
    });

    it('should delete old images before inserting new ones', async () => {
      const mockProduct: Product = {
        id: validProductId,
        name: 'Test',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      const callOrder: string[] = [];

      mockRepository.update.mockResolvedValue(mockProduct);
      mockRepository.deleteProductImages.mockImplementation(async () => {
        callOrder.push('delete');
      });
      mockRepository.insertProductImages.mockImplementation(async () => {
        callOrder.push('insert');
      });

      await productService.updateProduct(validProductId, {
        name: 'Test',
        images: [{ image_url: 'http://example.com/img.jpg' }]
      });

      expect(callOrder).toEqual(['delete', 'insert']);
    });

    it('should update product without touching images when not provided', async () => {
      const mockProduct: Product = {
        id: validProductId,
        name: 'Updated Name',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      mockRepository.update.mockResolvedValue(mockProduct);

      await productService.updateProduct(validProductId, {
        name: 'Updated Name'
      });

      expect(mockRepository.update).toHaveBeenCalledWith(validProductId, {
        name: 'Updated Name',
        description: undefined,
        brand: undefined,
        category: undefined
      });
      expect(mockRepository.deleteProductImages).not.toHaveBeenCalled();
      expect(mockRepository.insertProductImages).not.toHaveBeenCalled();
    });

    it('should call repository methods in correct order', async () => {
      const mockProduct: Product = {
        id: validProductId,
        name: 'Test',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };
      const callOrder: string[] = [];

      mockRepository.update.mockImplementation(async () => {
        callOrder.push('update');
        return mockProduct;
      });
      mockRepository.deleteProductImages.mockImplementation(async () => {
        callOrder.push('delete');
      });
      mockRepository.insertProductImages.mockImplementation(async () => {
        callOrder.push('insert');
      });

      await productService.updateProduct(validProductId, {
        name: 'Test',
        images: [{ image_url: 'http://example.com/img.jpg' }]
      });

      expect(callOrder).toEqual(['update', 'delete', 'insert']);
    });
  });
});
