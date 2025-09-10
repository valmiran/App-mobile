import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Animated,
  LayoutChangeEvent,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { processoSchema, ProcessoForm, toUpperAlnum } from '../utils/validators';
import { scheduleLocal } from '../utils/notifications';
import {
  addProcess,
  finalizeProcess,
  setObservation,
  setOpen,
  type Processo as ProcType,
} from '../services/processos.service';

type Proc = ProcType;

export default function ProcessosScreen() {
  const [lista, setLista] = useState<Proc[]>([]);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  // ---- Animated form collapse
  const measured = useRef(false);
  const contentH = useRef(320); // fallback
  const anim = useRef(new Animated.Value(0)).current; // 0 = expandido, 1 = recolhido

  const maxHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [contentH.current, 0],
  });

  function onFormLayout(e: LayoutChangeEvent) {
    if (measured.current) return;
    measured.current = true;
    contentH.current = Math.max(280, Math.round(e.nativeEvent.layout.height));
  }

  function toggleForm() {
    Animated.timing(anim, {
      toValue: collapsed ? 0 : 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => setCollapsed(!collapsed));
  }

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<ProcessoForm>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      processNumber: '',
      tipo: 'AHL',
      cliente: '',
      pnr: '',
      bag: '',
      dano: '',
      solucao: undefined
    }
  });

  const tipo = watch('tipo');

  async function criar(data: ProcessoForm) {
    // BLOQUEIO DE DUPLICIDADE local
    const existsLocal = lista.some(p => p.processNumber === data.processNumber);
    if (existsLocal) return Alert.alert('Duplicado', `Já existe um processo ${data.processNumber}.`);

    const novo: Proc = { ...data, status: 'aberto', criadoEm: new Date() };

    // Atualiza local
    setLista(p => [novo, ...p]);

    // Alimenta o serviço (para o header ler resumo)
    try {
      addProcess(novo);
    } catch (e: any) {
      // se o serviço acusar duplicado (outro lugar criou), desfaz local:
      setLista(p => p.filter(x => x.processNumber !== novo.processNumber));
      return Alert.alert('Duplicado', e.message || 'Processo já existente.');
    }

    // Alertas 4 e 5 dias
    await scheduleLocal('Processo — Atenção', `Processo ${data.processNumber} está perto de vencer.`, new Date(Date.now() + 4*24*60*60*1000));
    await scheduleLocal('Processo — Vencido', `Processo ${data.processNumber} venceu.`, new Date(Date.now() + 5*24*60*60*1000));

    Alert.alert('Sucesso', `Processo ${data.processNumber} criado.`);
  }

  function finalizar(processNumber: string) {
    setLista(p => p.map(x =>
      x.processNumber === processNumber ? { ...x, status: 'finalizado', finalizadoEm: new Date() } : x
    ));
    finalizeProcess(processNumber);
  }

  function observar(processNumber: string) {
    setLista(p => p.map(x =>
      x.processNumber === processNumber ? { ...x, status: 'observação' } : x
    ));
    setObservation(processNumber);
  }

  function reabrir(processNumber: string) {
    setLista(p => p.map(x =>
      x.processNumber === processNumber ? { ...x, status: 'aberto' } : x
    ));
    setOpen(processNumber);
  }

  // ---- Filtro de busca (nº, tipo, status)
  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(p =>
      p.processNumber.toLowerCase().includes(q) ||
      p.tipo.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  }, [lista, query]);

  return (
    <View style={s.container}>
      <Text style={s.title}>Processos — AHL / DPR / OHD</Text>

      {/* Botão Toggle Form */}
      <TouchableOpacity style={s.toggle} onPress={toggleForm} activeOpacity={0.8}>
        <MaterialCommunityIcons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={22}
          color={colors.text}
        />
        <Text style={s.toggleText}>
          {collapsed ? 'Mostrar formulário de criação' : 'Ocultar formulário de criação'}
        </Text>
      </TouchableOpacity>

      {/* Formulário com animação */}
      <Animated.View style={[s.animatedWrap, { maxHeight }]} onLayout={onFormLayout}>
        <Card>
          <Input
            label="Número do processo (ex: MCZAD17656)"
            placeholder="MCZAD17656"
            onChangeText={(t)=> setValue('processNumber', toUpperAlnum(t), { shouldValidate: true })}
            error={errors.processNumber?.message}
          />
          <Input
            label="Tipo (AHL|DPR|OHD)"
            placeholder="AHL"
            onChangeText={(t)=> setValue('tipo', toUpperAlnum(t) as any, { shouldValidate: true })}
            error={errors.tipo?.message}
          />

          {tipo === 'AHL' && (
            <>
              <Input label="Cliente" onChangeText={(t)=> setValue('cliente', t, { shouldValidate: true })}
                     error={errors.cliente?.message}/>
              <Input label="PNR" onChangeText={(t)=> setValue('pnr', t, { shouldValidate: true })}
                     error={errors.pnr?.message}/>
            </>
          )}

          {(tipo === 'AHL' || tipo === 'OHD') && (
            <Input label="Descrição da bag (cor/material/padrão/tamanho/bagtag)"
                   onChangeText={(t)=> setValue('bag', t, { shouldValidate: true })}
                   error={errors.bag?.message}/>
          )}

          {tipo === 'DPR' && (
            <>
              <Input label="Descrever dano"
                     onChangeText={(t)=> setValue('dano', t, { shouldValidate: true })}
                     error={errors.dano?.message}/>
              <Input label="Solução (Conserto|Mala nova|Voucher|Não há tratativas)"
                     onChangeText={(t)=> setValue('solucao', t as any, { shouldValidate: true })}
                     error={errors.solucao?.message}/>
            </>
          )}

          <Button title="Criar processo" onPress={handleSubmit(criar)} />
        </Card>
      </Animated.View>

      {/* Busca por processos */}
      <Card>
        <Input
          label="Buscar (nº, tipo ou status)"
          placeholder="Ex.: MCZAD, AHL, observação, finalizado..."
          onChangeText={setQuery}
        />
      </Card>

      {/* Lista */}
      <FlatList
        style={{ marginTop: 12 }}
        data={filtrados}
        keyExtractor={(i)=> i.processNumber}
        renderItem={({ item }) => (
          <Card>
            <View style={{ position: 'relative' }}>
              {/* Ícone de olho quando em observação */}
              {item.status === 'observação' && (
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color={colors.primary}
                  style={s.eyeIcon}
                />
              )}

              <Text style={s.item}>{item.processNumber} — {item.tipo} — {item.status}</Text>
              {!!item.bag && <Text style={s.sub}>{item.bag}</Text>}
              {!!item.dano && <Text style={s.sub}>Dano: {item.dano} | Solução: {item.solucao}</Text>}

              {item.status !== 'finalizado' && (
                <View style={s.actions}>
                  {item.status === 'observação' ? (
                    <>
                      <Button title="Voltar p/ Aberto" onPress={() => reabrir(item.processNumber)} />
                      <Button title="Finalizar" onPress={() => finalizar(item.processNumber)} />
                    </>
                  ) : (
                    <>
                      <Button title="Observação" onPress={() => observar(item.processNumber)} />
                      <Button title="Finalizar" onPress={() => finalizar(item.processNumber)} />
                    </>
                  )}
                </View>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
            Nenhum processo encontrado.
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },

  // toggle
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  toggleText: { color: colors.text, fontSize: 13 },

  // animated wrap
  animatedWrap: {
    overflow: 'hidden',
    marginBottom: 10,
  },

  // list item
  item: { color: colors.text, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  eyeIcon: { position: 'absolute', top: -2, right: -2 },
});
