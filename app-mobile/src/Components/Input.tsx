import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../Theme/colors';

type Props = {
  label?: string;
  error?: string;
  onChangeText?: (text: string) => void;
} & Omit<TextInputProps, 'onChangeText'>;

export default function Input({ label, error, onChangeText, style, ...rest }: Props) {
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        style={[s.input, style]}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        {...rest}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: colors.text, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0F172A',
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10
  },
  error: { color: colors.danger, marginTop: 6, fontSize: 12 }
});
