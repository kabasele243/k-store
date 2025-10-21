import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ComponentStyles } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ComponentStyles.card.backgroundColor,
    borderRadius: ComponentStyles.card.borderRadius,
    padding: ComponentStyles.card.padding,
    borderWidth: ComponentStyles.card.borderWidth,
    borderColor: ComponentStyles.card.borderColor,
  },
});
