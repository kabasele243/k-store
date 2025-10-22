import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ComponentStyles, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...ComponentStyles.card,
    ...Shadows.sm,
  },
});
