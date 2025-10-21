import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProductStore } from '@/stores/useProductStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ProductsScreen() {
  const { user, session, signOut } = useAuth();
  const { products, loading, error, fetchProducts, clearError } = useProductStore();

  useEffect(() => {
    if (!user || !session) {
      return;
    }
    fetchProducts(session.access_token);
  }, [user, session]);

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

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)}>
      <Card style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.stockBadge}>{getTotalStock(item)} in stock</Text>
        </View>
        {item.brand && <Text style={styles.productBrand}>{item.brand}</Text>}
        {item.category && <Text style={styles.productCategory}>{item.category}</Text>}
        <Text style={styles.variantCount}>
          {item.variants?.length || 0} variant(s)
        </Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Button
          title="Sign Out"
          onPress={signOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Add your first product to get started</Text>
          </View>
        }
      />

      <Button
        title="Add Product"
        onPress={() => router.push('/add-product')}
        style={styles.addButton}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  title: {
    ...Typography.displayHeading,
  },
  signOutButton: {
    paddingHorizontal: Spacing.md,
    height: 36,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 100,
  },
  productCard: {
    marginBottom: Spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  productName: {
    ...Typography.sectionTitle,
    flex: 1,
  },
  stockBadge: {
    ...Typography.label,
    color: Colors.accent.secondary,
    fontWeight: '600',
  },
  productBrand: {
    ...Typography.bodySecondary,
    marginBottom: Spacing.xs,
  },
  productCategory: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  variantCount: {
    ...Typography.label,
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
