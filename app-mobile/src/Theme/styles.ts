// src/Theme/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  footer: {
    height: 40,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
  },
});
