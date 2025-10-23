import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function CategoriesScreen() {
  const { user, session } = useAuth();
  const { categories, loading, error, fetchCategories, clearError } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user || !session) {
      return;
    }
    fetchCategories(session.access_token).then(() => {
      setLastRefreshed(new Date());
    });
  }, [user, session]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleRefresh = () => {
    if (session) {
      fetchCategories(session.access_token).then(() => {
        setLastRefreshed(new Date());
      });
    }
  };

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return '';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    setActiveCategory(categoryId);
    // Optional: Navigate after a short delay to show the active state
    setTimeout(() => {
      router.push({
        pathname: '/category/[id]',
        params: { id: categoryId, name: categoryName }
      });
    }, 200);
  };

  const renderCategory = ({ item }: { item: any }) => {
    return (
      <CategoryCard
        category={item}
        onPress={() => handleCategoryPress(item.id, item.name)}
        isActive={activeCategory === item.id}
      />
    );
  };

  const renderSkeletonLoading = () => (
    <View style={styles.container}>
      <View style={[styles.listContent, { paddingTop: insets.top + Spacing.md }]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    </View>
  );

  if (loading && categories.length === 0) {
    return renderSkeletonLoading();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + Spacing.md }]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          activeCategory ? (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Active Category: {activeCategory}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Categories will appear here'}
            </Text>
          </View>
        }
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
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  activeIndicator: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.primary,
    textAlign: 'center',
  },
  skeletonCard: {
    height: 256,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
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
});
