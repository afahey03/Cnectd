import { MD3DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';

export const palette = {
  bg: '#0B0E14',
  card: '#121721',
  cardAlt: '#0F1420',
  border: '#1E2633',
  text: '#E7ECF5',
  textMuted: '#9AA6B2',
  primary: '#5B8CFF',
  primaryDim: '#476FCC',
  success: '#3DDC97',
  danger: '#FF6B6B',
  bubbleMine: '#1F2A44',
  bubbleOther: '#151B27',
  inputBg: '#111724',
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.primary,
    background: palette.bg,
    surface: palette.card,
    onSurface: palette.text,
    outline: palette.border,
  },
};

export const headerHeight = Platform.select({ ios: 52, android: 56, default: 56 });
