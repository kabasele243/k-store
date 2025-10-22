import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useProductStore } from '@/stores/useProductStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { SwipeableProductCard } from '@/components/ui/SwipeableProductCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function ProductsScreen() {
  const { user, session, signOut } = useAuth();
  const { products, loading, error, fetchProducts, clearError, deleteProduct } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user || !session) {
      return;
    }
    fetchProducts(session.access_token).then(() => {
      setLastRefreshed(new Date());
    });
  }, [user, session]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleRefresh = () => {
    if (session) {
      fetchProducts(session.access_token).then(() => {
        setLastRefreshed(new Date());
      });
    }
  };

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return '';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
      return { color: Colors.status.danger, label: 'Out of Stock', icon: '⚠️' };
    }
    if (total < 10) {
      return { color: Colors.status.warning, label: 'Low Stock', icon: '⚡' };
    }
    return { color: Colors.status.success, label: 'In Stock', icon: '✓' };
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleDeleteProduct = async (id: string) => {
    if (!session) return;
    try {
      await deleteProduct(session.access_token, id);
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

  const renderSkeletonLoading = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Products</Text>
          <Button
            title="Sign Out"
            onPress={signOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search products, brands, categories..."
          placeholderTextColor={Colors.text.secondary}
          editable={false}
        />
      </View>
      <View style={styles.listContent}>
        {[1, 2, 3, 4, 5].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );

  if (loading && products.length === 0) {
    return renderSkeletonLoading();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Products</Text>
            {lastRefreshed && (
              <Text style={styles.lastUpdated}>Updated {getTimeAgo(lastRefreshed)}</Text>
            )}
          </View>
          <Button
            title="Sign Out"
            onPress={signOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search products, brands, categories..."
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
              {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    ...Typography.displayHeading,
  },
  lastUpdated: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  signOutButton: {
    paddingHorizontal: Spacing.md,
    height: 36,
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
  productCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.md,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.background.primary,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  productBrand: {
    ...Typography.bodySecondary,
    fontWeight: '500',
  },
  productCategory: {
    ...Typography.bodySecondary,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantCount: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  stockStatus: {
    ...Typography.label,
    fontWeight: '600',
    fontSize: 13,
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
