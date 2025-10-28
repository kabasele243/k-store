import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useProductStore } from '@/stores/useProductStore';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { session } = useAuth();
  const { products, loading, error, fetchProducts, clearError } = useProductStore();
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

  const renderProduct = ({ item }: { item: any }) => {
    return (
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}` as any)}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: name || 'Products',
          headerShown: true,
          headerBackTitle: 'Categories',
        }}
      />
      <View style={styles.container}>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
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
});
