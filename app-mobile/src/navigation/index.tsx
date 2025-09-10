import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#0F172A' }
};

export default function NavigationRoot({ children }: any) {
  return <NavigationContainer theme={theme}>{children}</NavigationContainer>;
}
