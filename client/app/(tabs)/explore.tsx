import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
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
    const totalVariants = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);

    return {
      totalProducts,
      totalVariants,
    };
  }, [products]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Product catalog overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalVariants}</Text>
          <Text style={styles.statLabel}>Total Variants</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <CheckCircle size={20} color={Colors.accent.primary} />
          <Text style={styles.sectionTitle}>All Products</Text>
        </View>
        {products.map((product) => (
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
                <View style={[styles.alertBadge, { backgroundColor: Colors.accent.primary }]}>
                  <Text style={styles.alertBadgeText}>{product.variants?.length || 0}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
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
