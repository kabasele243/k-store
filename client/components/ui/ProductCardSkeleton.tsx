import React from 'react';
import { View, StyleSheet } from 'react-native';
import Card from './Card';
import { Skeleton } from './Skeleton';
import { Spacing } from '@/constants/theme';

export function ProductCardSkeleton() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Skeleton width="60%" height={20} />
        <Skeleton width={50} height={24} borderRadius={12} />
      </View>
      <View style={styles.meta}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="30%" height={14} />
      </View>
      <View style={styles.footer}>
        <Skeleton width="25%" height={12} />
        <Skeleton width="35%" height={12} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
