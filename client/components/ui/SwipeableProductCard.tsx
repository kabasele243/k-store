import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import Card from './Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface SwipeableProductCardProps {
  product: any;
  totalStock: number;
  stockStatus: {
    color: string;
    label: string;
    icon: string;
  };
  onDelete?: (id: string) => void;
}

export function SwipeableProductCard({
  product,
  totalStock,
  stockStatus,
  onDelete,
}: SwipeableProductCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(product.id),
        },
      ]
    );
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteAction}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity onPress={() => router.push(`/product/${product.id}` as any)}>
        <Card style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.stockBadgeText}>
                {stockStatus.icon} {totalStock}
              </Text>
            </View>
          </View>
          <View style={styles.productMeta}>
            {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
            {(product.category || product.product_categories?.[0]?.categories?.name) && (
              <Text style={styles.productCategory}>
                • {product.product_categories?.[0]?.categories?.name || product.category}
              </Text>
            )}
          </View>
          <View style={styles.productFooter}>
            <Text style={styles.variantCount}>
              {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
              {stockStatus.label}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface.primary,
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.md,
  },
  deleteAction: {
    backgroundColor: Colors.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  actionText: {
    color: Colors.background.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
