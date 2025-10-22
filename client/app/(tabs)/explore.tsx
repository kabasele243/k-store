import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { AlertCircle, Zap, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProductStore } from '@/stores/useProductStore';
import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function AnalyticsScreen() {
  const { user, session } = useAuth();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!user || !session) {
      return;
    }
    fetchProducts(session.access_token);
  }, [user, session]);

  const analytics = useMemo(() => {
    const totalProducts = products.length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockProducts: any[] = [];
    const outOfStockProducts: any[] = [];

    products.forEach(product => {
      let productStock = 0;
      product.variants?.forEach((variant: any) => {
        variant.inventory?.forEach((inv: any) => {
          productStock += inv.quantity;
        });
      });

      totalStock += productStock;

      if (productStock === 0) {
        outOfStockCount++;
        outOfStockProducts.push({ ...product, stock: productStock });
      } else if (productStock < 10) {
        lowStockCount++;
        lowStockProducts.push({ ...product, stock: productStock });
      }
    });

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      lowStockProducts: lowStockProducts.slice(0, 5),
      outOfStockProducts: outOfStockProducts.slice(0, 5),
    };
  }, [products]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Inventory insights at a glance</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalStock}</Text>
          <Text style={styles.statLabel}>Total Units</Text>
        </Card>

        <Card style={[styles.statCard, styles.warningCard]}>
          <Text style={[styles.statValue, { color: Colors.status.warning }]}>
            {analytics.lowStockCount}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </Card>

        <Card style={[styles.statCard, styles.dangerCard]}>
          <Text style={[styles.statValue, { color: Colors.status.danger }]}>
            {analytics.outOfStockCount}
          </Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </Card>
      </View>

      {analytics.outOfStockProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <AlertCircle size={20} color={Colors.status.danger} />
            <Text style={styles.sectionTitle}>Out of Stock</Text>
          </View>
          {analytics.outOfStockProducts.map((product, index) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Card style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertProductName}>{product.name}</Text>
                    {product.brand && (
                      <Text style={styles.alertProductBrand}>{product.brand}</Text>
                    )}
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: Colors.status.danger }]}>
                    <Text style={styles.alertBadgeText}>0</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {analytics.lowStockProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Zap size={20} color={Colors.status.warning} />
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          </View>
          {analytics.lowStockProducts.map((product, index) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Card style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertProductName}>{product.name}</Text>
                    {product.brand && (
                      <Text style={styles.alertProductBrand}>{product.brand}</Text>
                    )}
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: Colors.status.warning }]}>
                    <Text style={styles.alertBadgeText}>{product.stock}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {analytics.lowStockCount === 0 && analytics.outOfStockCount === 0 && (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <CheckCircle size={48} color={Colors.status.success} />
          </View>
          <Text style={styles.emptyTitle}>All Good!</Text>
          <Text style={styles.emptyText}>
            No stock alerts at the moment. Your inventory is healthy.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.displayHeading,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  warningCard: {
    borderColor: Colors.status.warning,
    borderWidth: 1.5,
  },
  dangerCard: {
    borderColor: Colors.status.danger,
    borderWidth: 1.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  alertCard: {
    marginBottom: Spacing.sm,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  alertProductBrand: {
    ...Typography.bodySecondary,
  },
  alertBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIconContainer: {
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySecondary,
    textAlign: 'center',
  },
});
