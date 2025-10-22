/**
 * Design System - Clean & Fast for Small Business
 * Optimized for speed of use and data entry
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#0066FF',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#0066FF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#3B82F6',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#3B82F6',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  surface: {
    primary: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  accent: {
    primary: '#0066FF',
    secondary: '#8B5CF6',
    tertiary: '#F59E0B',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#F3F4F6',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  // Overlay colors for subtle effects
  overlay: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.10)',
    dark: 'rgba(0, 0, 0, 0.20)',
  },
} as const;

export const Typography = {
  displayHeading: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodyPrimary: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  // Mono for numbers (better readability for quantities)
  mono: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
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
  xxl: 48,
  // Component-specific spacing
  cardGap: 12,
  inlineGap: 8,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ComponentStyles = {
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  searchBar: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  button: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
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
