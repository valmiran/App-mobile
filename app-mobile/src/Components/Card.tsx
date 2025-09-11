import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../Theme/colors';

export default function Card({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View style={[s.card, style]} {...rest}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#0E1628',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 10
  }
});
