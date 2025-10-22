import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UpdateProductModal from '@/components/ui/UpdateProductModal';
import { Colors, Typography, Spacing } from '@/constants/theme';

type TabType = 'overview' | 'variants' | 'inventory';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (!session || !id) return;
    fetchProduct();
  }, [session, id]);

  const fetchProduct = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data.product);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStock = () => {
    if (!product) return 0;
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

  const renderOverview = () => {
    const totalStock = getTotalStock();
    const stockStatus = getStockStatus(totalStock);

    return (
      <View style={styles.tabContent}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Product Name</Text>
            <Text style={styles.infoValue}>{product.name}</Text>
          </View>
          {product.brand && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Brand</Text>
              <Text style={styles.infoValue}>{product.brand}</Text>
            </View>
          )}
          {(product.category || product.product_categories?.[0]?.categories?.name) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>
                {product.product_categories?.[0]?.categories?.name || product.category}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Stock</Text>
            <View style={styles.stockInfo}>
              <Text style={[styles.infoValue, { color: stockStatus.color, fontWeight: '700' }]}>
                {totalStock} units
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
                <Text style={styles.statusText}>{stockStatus.label}</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Variants</Text>
            <Text style={styles.infoValue}>{product.variants?.length || 0}</Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderVariants = () => {
    if (!product.variants || product.variants.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No variants found</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {product.variants.map((variant: any, index: number) => {
          const variantStock = variant.inventory?.reduce(
            (sum: number, inv: any) => sum + inv.quantity,
            0
          ) || 0;

          return (
            <Card key={variant.id} style={styles.variantCard}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantSku}>SKU: {variant.sku}</Text>
                <Text style={styles.variantStock}>{variantStock} units</Text>
              </View>
              {variant.price && (
                <Text style={styles.variantPrice}>${variant.price.toFixed(2)}</Text>
              )}
              {variant.inventory && variant.inventory.length > 0 && (
                <View style={styles.locationsList}>
                  {variant.inventory.map((inv: any, idx: number) => (
                    <View key={idx} style={styles.locationItem}>
                      <Text style={styles.locationName}>
                        {inv.location || 'Default Location'}
                      </Text>
                      <Text style={styles.locationQty}>{inv.quantity} units</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </View>
    );
  };

  const renderInventory = () => {
    const inventoryByLocation: { [key: string]: number } = {};

    product.variants?.forEach((variant: any) => {
      variant.inventory?.forEach((inv: any) => {
        const location = inv.location || 'Default Location';
        inventoryByLocation[location] = (inventoryByLocation[location] || 0) + inv.quantity;
      });
    });

    const locations = Object.entries(inventoryByLocation);

    if (locations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No inventory data</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {locations.map(([location, quantity]) => (
          <Card key={location} style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>{location}</Text>
                <Text style={styles.locationSubtitle}>
                  {product.variants?.length || 0} variant(s)
                </Text>
              </View>
              <Text style={styles.locationTotal}>{quantity} units</Text>
            </View>
          </Card>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Product Not Found' }} />
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerBackTitle: 'Products',
        }}
      />
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'variants' && styles.activeTab]}
            onPress={() => setActiveTab('variants')}
          >
            <Text style={[styles.tabText, activeTab === 'variants' && styles.activeTabText]}>
              Variants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
            onPress={() => setActiveTab('inventory')}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>
              Inventory
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'variants' && renderVariants()}
          {activeTab === 'inventory' && renderInventory()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Update"
            onPress={() => setShowUpdateModal(true)}
            style={styles.updateButton}
          />
        </View>
      </View>

      <UpdateProductModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        productId={id}
        variants={product.variants || []}
        onSuccess={fetchProduct}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  errorText: {
    ...Typography.bodyPrimary,
    color: Colors.status.danger,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.accent.primary,
  },
  tabText: {
    ...Typography.bodyPrimary,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.screenPadding,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoRow: {
    marginBottom: Spacing.md,
  },
  infoLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.bodyPrimary,
    fontWeight: '500',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.background.primary,
  },
  variantCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  variantSku: {
    ...Typography.bodyPrimary,
    fontWeight: '600',
  },
  variantStock: {
    ...Typography.bodySecondary,
    color: Colors.status.success,
    fontWeight: '600',
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  locationsList: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  locationName: {
    ...Typography.bodySecondary,
  },
  locationQty: {
    ...Typography.bodySecondary,
    fontWeight: '500',
  },
  locationCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  locationSubtitle: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  locationTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.bodySecondary,
  },
  footer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  updateButton: {
    width: '100%',
  },
});
