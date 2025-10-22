import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Package } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardSize = (width - Spacing.screenPadding * 2 - Spacing.md) / 2;

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { width: cardSize, height: cardSize }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Package size={32} color={Colors.accent.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
      {category.description && (
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.sectionTitle,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.bodySecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
