import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

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
  const categoryProducts = useMemo(() => {
    return products.filter(product => {
      const categoryId = product.product_categories?.[0]?.category_id;
      return categoryId === id;
    });
  }, [products, id]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;

    const query = searchQuery.toLowerCase();
    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  }, [categoryProducts, searchQuery]);

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
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Button
              title="← Back"
              onPress={() => router.back()}
              variant="outline"
              style={styles.backButton}
            />
            <Text style={styles.title}>{name || 'Category'}</Text>
          </View>
          <Text style={styles.productCount}>{filteredProducts.length} products</Text>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search products..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
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
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found' : 'No products in this category'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add products to this category to see them here'}
            </Text>
          </View>
        }
      />

      <Button
        title="Add Product"
        onPress={() => router.push('/add-product')}
        style={[styles.addButton, { bottom: Math.max(insets.bottom, Spacing.lg) }]}
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
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    paddingHorizontal: Spacing.md,
    height: 36,
  },
  title: {
    ...Typography.displayHeading,
    fontSize: 20,
  },
  productCount: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  searchBar: {
    height: 48,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    fontSize: Typography.bodyPrimary.fontSize,
    color: Colors.text.primary,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.sectionTitle,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodySecondary,
  },
  addButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
  },
});
