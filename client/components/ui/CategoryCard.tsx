import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryImage } from '@/utils/categoryImages';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    tag?: string;
    imagePath?: string; // Changed from image_url to imagePath
  };
  onPress: () => void;
  isActive?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - Spacing.screenPadding * 2;

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  isActive = false
}) => {
  // Get local image from category imagePath
  const categoryImage = category.imagePath
    ? getCategoryImage(category.imagePath)
    : require('@/assets/images/categories/accessoires.jpg'); // fallback


  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth },
        isActive && styles.cardActive
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={categoryImage}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.75)']}
          style={styles.gradient}
        >
          {/* Top Section - Tag and Bookmark */}
          <View style={styles.topSection}>
            {category.tag && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{category.tag.toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.bookmarkContainer}>
              <Bookmark size={18} color={Colors.text.inverse} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Bottom Section - Title and Metadata */}
          <View style={styles.bottomSection}>
            <Text style={styles.title} numberOfLines={2}>
              {category.name.toUpperCase()}
            </Text>
            {category.description && (
              <Text style={styles.metadata} numberOfLines={1}>
                {category.description}
              </Text>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 256,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface.primary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    ...Shadows.lg,
  },
  cardActive: {
    borderWidth: 3,
    borderColor: Colors.accent.primary,
    transform: [{ scale: 1.02 }],
    ...Shadows.lg,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: BorderRadius.lg,
  },
  gradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tag: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },
  bookmarkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.inverse,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  metadata: {
    fontSize: 14,
    color: Colors.background.secondary,
    fontWeight: '400',
  },
});
