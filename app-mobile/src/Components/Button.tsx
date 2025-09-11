import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../Theme/colors';

type Props = {
  title: string;
  loading?: boolean;
} & TouchableOpacityProps;

export default function Button({ title, loading, style, disabled, ...rest }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[s.btn, isDisabled && s.btnDisabled, style]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.txt}>{title}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDisabled: { opacity: 0.6 },
  txt: { color: '#fff', fontWeight: '700' }
});
