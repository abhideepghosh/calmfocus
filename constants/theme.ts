/**
 * Calm Focus Design System
 * A comprehensive theme definition for a modern, premium feel.
 */

import { Platform } from 'react-native';

const tintColorLight = '#4A90E2';
const tintColorDark = '#5FA5F8';

export const Colors = {
  light: {
    // Brand & Semantic
    primary: '#4A90E2', // Deep Focus Blue
    primaryForeground: '#FFFFFF',
    secondary: '#E6F4FE',
    secondaryForeground: '#4A90E2',
    accent: '#88B04B', // Sage Green
    destructive: '#FF6B6B', // Soft Salmon
    success: '#88B04B', // Using Accent/Sage Green for success indicators too or keep distinct
    warning: '#FFA726',

    // Backgrounds & Surfaces
    background: '#FAFAFA', // Off-White
    card: '#FFFFFF',
    modal: '#FFFFFF',

    // Text
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // UI Elements
    border: '#E1E4E8',
    input: '#F0F2F5',

    // Navigation
    tint: tintColorLight,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Brand & Semantic
    primary: '#5FA5F8',
    primaryForeground: '#FFFFFF',
    secondary: '#1A2A38',
    secondaryForeground: '#E6F4FE',
    accent: '#88B04B',
    destructive: '#FF6B6B',
    success: '#88B04B',
    warning: '#FFB74D',

    // Backgrounds & Surfaces
    background: '#121212', // Soft Dark Mode
    card: '#1E1E1E',
    modal: '#1E1E1E',

    // Text
    text: '#ECEDEE',
    textSecondary: '#A1A1AA',
    textTertiary: '#52525B',

    // UI Elements
    border: '#27272A',
    input: '#27272A',

    // Navigation
    tint: tintColorDark,
    tabIconDefault: '#52525B',
    tabIconSelected: tintColorDark,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  heading: {
    hero: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
    h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  },
  body: {
    lg: { fontSize: 18, lineHeight: 28 },
    md: { fontSize: 16, lineHeight: 24 },
    sm: { fontSize: 14, lineHeight: 20 },
    xs: { fontSize: 12, lineHeight: 16 },
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'sans-serif-rounded',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
