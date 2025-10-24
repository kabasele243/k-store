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
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardActive: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    transform: [{ scale: 1.01 }],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.inverse,
    letterSpacing: 1,
  },
  bookmarkContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  bottomSection: {
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.inverse,
    letterSpacing: 1,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metadata: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
