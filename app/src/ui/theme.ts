import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export const colors = {
  primary: '#4C6FFF',
  primaryDark: '#3C57CC',
  bg: '#0B0D12',
  card: '#12151C',
  border: '#202532',
  text: '#E6E9F2',
  textMuted: '#94A0B4',
  success: '#34C759',
  bubbleMine: '#2B7A0B', // subtle green
  bubbleMineSoft: '#DCF8C6',
  bubbleOther: '#1B1F2A',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: '#F7F9FC',
    surface: '#FFFFFF',
    onSurface: '#0B0D12',
    outline: '#E6E9F2',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    surface: colors.card,
    onSurface: colors.text,
    outline: colors.border,
  },
};

export const headerHeight = Platform.select({ ios: 52, android: 56, default: 56 });
