import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useProductStore } from '@/stores/useProductStore';
import Button from '@/components/ui/Button';
import { SwipeableProductCard } from '@/components/ui/SwipeableProductCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { session } = useAuth();
  const { products, loading, error, fetchProducts, clearError, deleteProduct } = useProductStore();

  useEffect(() => {
    if (!session) return;
    fetchProducts(session.access_token);
  }, [session]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleRefresh = () => {
    if (session) {
      fetchProducts(session.access_token);
    }
  };

  const getTotalStock = (product: any) => {
    let total = 0;
    product.variants?.forEach((variant: any) => {
      variant.inventory?.forEach((inv: any) => {
        total += inv.quantity;
      });
    });
    return total;
  };

  const getStockStatus = (total: number) => {
    if (total === 0) {
      return { color: Colors.status.danger, label: 'Out of Stock' };
    }
    if (total < 10) {
      return { color: Colors.status.warning, label: 'Low Stock' };
    }
    return { color: Colors.status.success, label: 'In Stock' };
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Handle both data structures
      if (product.product_categories?.[0]?.category_id) {
        return product.product_categories[0].category_id === id;
      }

      // Handle category_ids as JSON string
      if (product.category_ids) {
        try {
          const categoryIds = typeof product.category_ids === 'string'
            ? JSON.parse(product.category_ids)
            : product.category_ids;
          return categoryIds.includes(id);
        } catch {
          return false;
        }
      }

      return false;
    });
  }, [products, id]);

  const handleDeleteProduct = async (productId: string) => {
    if (!session) return;
    try {
      await deleteProduct(session.access_token, productId);
    } catch (error: any) {
      Alert.alert('Delete Failed', error.message);
    }
  };

  const renderProduct = ({ item }: { item: any }) => {
    const totalStock = getTotalStock(item);
    const stockStatus = getStockStatus(totalStock);

    return (
      <SwipeableProductCard
        product={item}
        totalStock={totalStock}
        stockStatus={stockStatus}
        onDelete={handleDeleteProduct}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
        <View style={styles.titleSection}>
          <Text style={styles.title}>{name || 'Category'}</Text>
          <Text style={styles.productCount}>{filteredProducts.length} products</Text>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products in this category</Text>
            <Text style={styles.emptySubtext}>
              Add products to this category to see them here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  backButton: {
    paddingHorizontal: Spacing.md,
    height: 36,
    alignSelf: 'flex-start',
  },
  titleSection: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.displayHeading,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  productCount: {
    ...Typography.label,
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl * 3,
  },
  emptyText: {
    ...Typography.sectionTitle,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodySecondary,
    textAlign: 'center',
  },
});
