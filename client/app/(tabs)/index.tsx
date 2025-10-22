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
import Button from '@/components/ui/Button';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function CategoriesScreen() {
  const { user, session, signOut } = useAuth();
  const { categories, loading, error, fetchCategories, clearError } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
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
    router.push({
      pathname: '/category/[id]',
      params: { id: categoryId, name: categoryName }
    });
  };

  const renderCategory = ({ item }: { item: any }) => {
    return (
      <CategoryCard
        category={item}
        onPress={() => handleCategoryPress(item.id, item.name)}
      />
    );
  };

  const renderSkeletonLoading = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Categories</Text>
          <Button
            title="Sign Out"
            onPress={signOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search categories..."
          placeholderTextColor={Colors.text.secondary}
          editable={false}
        />
      </View>
      <View style={styles.listContent}>
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Categories</Text>
            {lastRefreshed && (
              <Text style={styles.lastUpdated}>Updated {getTimeAgo(lastRefreshed)}</Text>
            )}
          </View>
          <Button
            title="Sign Out"
            onPress={signOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search categories..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
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
  header: {
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.displayHeading,
  },
  lastUpdated: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  signOutButton: {
    paddingHorizontal: Spacing.md,
    height: 36,
  },
  searchBar: {
    height: 48,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    fontSize: Typography.bodyPrimary.fontSize,
    color: Colors.text.primary,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  skeletonCard: {
    height: 80,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
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
