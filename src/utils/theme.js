// src/utils/theme.js
import { MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#000000',   // full black
    surface: '#121212',      // cards, containers
    primary: '#BB86FC',
    onPrimary: '#FFFFFF',
    text: '#FFFFFF',
    outline: '#444444',
    accent: '#03DAC6',
    success: '#4CAF50',
    warning: '#FFC107',
  },
};
