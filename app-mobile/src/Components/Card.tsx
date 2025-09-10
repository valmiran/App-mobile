import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../Theme/colors';

export default function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: '#0B1220', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }
});
