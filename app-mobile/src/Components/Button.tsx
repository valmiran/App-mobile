import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../Theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, loading, style }: Props) {
  return (
    <TouchableOpacity style={[s.btn, style]} onPress={onPress} disabled={!!loading}>
      {loading ? <ActivityIndicator /> : <Text style={s.txt}>{title}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  txt: { color: '#052e16', fontWeight: '700', fontSize: 16 }
});
