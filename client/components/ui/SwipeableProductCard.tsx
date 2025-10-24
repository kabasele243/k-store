import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { AlertCircle, Zap, Check, Trash2, Package } from 'lucide-react-native';
import Card from './Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface SwipeableProductCardProps {
  product: any;
  totalStock: number;
  stockStatus: {
    color: string;
    label: string;
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

  const getStockIcon = () => {
    if (totalStock === 0) {
      return <AlertCircle size={14} color={Colors.background.primary} />;
    }
    if (totalStock < 10) {
      return <Zap size={14} color={Colors.background.primary} />;
    }
    return <Check size={14} color={Colors.background.primary} />;
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteAction}
        >
          <Trash2 size={20} color={Colors.background.primary} />
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
          <View style={styles.cardContent}>
            {product.image_url || product.images?.[0] ? (
              <Image
                source={{ uri: product.image_url || product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Package size={32} color={Colors.text.tertiary} strokeWidth={1.5} />
              </View>
            )}

            <View style={styles.productInfo}>
              <View style={styles.productHeader}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                  {getStockIcon()}
                  <Text style={styles.stockBadgeText}>{totalStock}</Text>
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
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface.primary,
  },
  cardContent: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface.secondary,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 48,
    justifyContent: 'center',
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.background.primary,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  productBrand: {
    ...Typography.bodySecondary,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  productCategory: {
    ...Typography.bodySecondary,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantCount: {
    ...Typography.label,
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  stockStatus: {
    ...Typography.label,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.lg,
  },
  deleteAction: {
    backgroundColor: Colors.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    gap: 6,
    borderRadius: 12,
  },
  actionText: {
    color: Colors.background.primary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
