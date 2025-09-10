import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { globalStyles } from '../Theme/styles';
import { useAuth } from '../context/Authcontext';
import { loginSchema, type LoginForm } from '../utils/validators';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const password = watch('password') ?? '';
  const tooLong = password.length > 12;

  const passwordMessages = useMemo(() => {
    const e = errors.password;
    if (!e) return [];
    const msgs: string[] = [];
    
    const raw: any = e?.types || e?.message || e;
    if (typeof raw === 'string') msgs.push(raw);
    if (Array.isArray(raw)) raw.forEach((m) => typeof m === 'string' && msgs.push(m));
    if (e?.message && !msgs.includes(e.message)) msgs.push(e.message as string);
    return msgs.length ? msgs : [e.message as string].filter(Boolean);
  }, [errors.password]);

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.appName}>Airport Agent</Text>
        <Text style={s.subtitle}>Guia do Agente de Aeroporto</Text>
      </View>

      <View style={s.content}>
        <Card>
          <Input
            label="Login"
            placeholder="Digite seu login aqui..."
            autoCapitalize="none"
            onChangeText={(t) => setValue('email', t, { shouldValidate: true })}
            error={errors.email?.message}
          />

          <Input
            label="Senha"
            secureTextEntry
            onChangeText={(t) => setValue('password', t, { shouldValidate: true })}
            error={passwordMessages[0]}
          />

          <Button title="Entrar" onPress={handleSubmit(onSubmit)} loading={loading} />

          {tooLong && <Text style={globalStyles.errorText}>A senha deve ter no máximo 12 caracteres.</Text>}
        </Card>
      </View>

      {/* Footer fixo preto */}
      <View style={globalStyles.footer}>
        <Text style={globalStyles.footerText}>Airport Agent Lmtd.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  appName: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.text,
    opacity: 0.85,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
});
