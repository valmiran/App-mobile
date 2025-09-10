import React from 'react';
import { TextInput, StyleSheet, Text, View, TextInputProps } from 'react-native';
import { colors } from '../Theme/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[s.input, style]}
        {...rest}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: "#0B1220",
    color: colors.text, borderRadius: 10, padding: 12
  },
  error: { color: "#FCA5A5", marginTop: 6 }
});
