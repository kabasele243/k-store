import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  created_at: string;
  variants?: Array<{
    id: string;
    sku: string;
    price?: number;
    inventory?: Array<{
      quantity: number;
      location?: string;
    }>;
  }>;
}

export default function ProductsScreen() {
  const { user, session, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/products`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user || !session) {
      return;
    }
    fetchProducts();
  }, [user, session]);

  const getTotalStock = (product: Product) => {
    let total = 0;
    product.variants?.forEach((variant) => {
      variant.inventory?.forEach((inv) => {
        total += inv.quantity;
      });
    });
    return total;
  };

  const renderProduct = ({ item }: { item: Product }) => (
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
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchProducts();
          }} />
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
