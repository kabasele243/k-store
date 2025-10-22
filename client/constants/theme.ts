/**
 * Design System - Lululemon Inspired Theme
 * Based on design.json style guide
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#D82934',
    icon: '#6D6E71',
    tabIconDefault: '#6D6E71',
    tabIconSelected: '#D82934',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#D82934',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#D82934',
  },
  background: {
    primary: '#FFFFFF',
  },
  surface: {
    primary: '#F7F7F7',
  },
  text: {
    primary: '#000000',
    secondary: '#6D6E71',
  },
  accent: {
    primary: '#D82934',
    secondary: '#3A7BD5',
  },
  border: {
    primary: '#EAEAEA',
  },
  status: {
    success: '#66BB6A',
    warning: '#FFA726',
    danger: '#D82934',
    info: '#3A7BD5',
  },
} as const;

export const Typography = {
  displayHeading: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  bodyPrimary: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.primary,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
} as const;

export const Spacing = {
  baseUnit: 8,
  screenPadding: 16,
  sectionSpacing: 24,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const ComponentStyles = {
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  searchBar: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.sm,
    height: 48,
    paddingHorizontal: 12,
  },
  icon: {
    size: 24,
    strokeWidth: 1.5,
    color: Colors.text.secondary,
    activeColor: Colors.text.primary,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
