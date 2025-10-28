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
import { apiFetch } from '@/utils/api';

type TabType = 'overview' | 'variants';

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
      const data = await apiFetch<{ product: any }>(`/products/${id}`, {
        token: session.access_token,
      });
      setProduct(data.product);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
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
          return (
            <Card key={variant.id} style={styles.variantCard}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantSku}>SKU: {variant.sku}</Text>
              </View>
              {variant.price && (
                <Text style={styles.variantPrice}>${variant.price.toFixed(2)}</Text>
              )}
            </Card>
          );
        })}
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
        <View style={styles.tabBarWrapper}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'variants' && styles.activeTab]}
              onPress={() => setActiveTab('variants')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'variants' && styles.activeTabText]}>
                Variants
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'variants' && renderVariants()}
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
  tabBarWrapper: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 0.2,
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
  variantPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
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
