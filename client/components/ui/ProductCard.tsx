import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Package } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    image_url?: string;
    images?: string[];
    variants?: any[];
  };
  onPress: () => void;
  isActive?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - Spacing.screenPadding * 2;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isActive = false
}) => {
  const productImage = product.image_url || product.images?.[0];

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
      {productImage ? (
        <ImageBackground
          source={{ uri: productImage }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.75)']}
            style={styles.gradient}
          >
            {/* Bottom Section - Title and Metadata */}
            <View style={styles.bottomSection}>
              <Text style={styles.title} numberOfLines={2}>
                {product.name.toUpperCase()}
              </Text>
              <View style={styles.metadataRow}>
                {product.brand && (
                  <Text style={styles.metadata} numberOfLines={1}>
                    {product.brand}
                  </Text>
                )}
                <Text style={styles.metadata}>
                  {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderIcon}>
            <Package size={48} color={Colors.text.tertiary} strokeWidth={1.5} />
          </View>
          <View style={styles.bottomSection}>
            <Text style={styles.titleDark} numberOfLines={2}>
              {product.name.toUpperCase()}
            </Text>
            <View style={styles.metadataRow}>
              {product.brand && (
                <Text style={styles.metadataDark} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
              <Text style={styles.metadataDark}>
                {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      )}
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
    justifyContent: 'flex-end',
  },
  placeholderContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: Colors.surface.secondary,
  },
  placeholderIcon: {
    alignSelf: 'center',
    marginTop: Spacing.xl * 2,
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
  titleDark: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: 1,
    lineHeight: 30,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  metadata: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  metadataDark: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
