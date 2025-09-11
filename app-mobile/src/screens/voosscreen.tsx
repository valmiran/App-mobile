import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';

import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { scheduleLocal } from '../utils/notifications';

import {
  addVoo,
  listVoos,
  onVoosChange,
  type Voo,
} from '../services/voos.service';

// --- util: cria uma Date hoje a partir de "HH:MM" ---
function dateTodayAt(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const [_, HH, MM] = m;
  const d = new Date();
  d.setHours(Number(HH), Number(MM), 0, 0);
  return d;
}

export default function VoosScreen() {
  const [codigo, setCodigo] = useState('');
  const [od, setOd] = useState('');        // "REC/VCP" ou só "REC"
  const [hora, setHora] = useState('');    // "HH:MM"
  const [lista, setLista] = useState<Voo[]>(() => listVoos());

  // sincroniza a tela com o serviço (e StatusBarOperacao também escuta o serviço)
  useEffect(() => {
    const unsub = onVoosChange(setLista);
    return unsub;
  }, []);

  async function add() {
    if (!codigo || !hora) {
      return Alert.alert('Erro', 'Preencha o código do voo e a hora (HH:MM).');
    }

    const eta = dateTodayAt(hora);
    if (!eta) {
      return Alert.alert('Erro', 'Hora inválida. Use o formato HH:MM (ex.: 08:30).');
    }

    let origem: string | undefined;
    let destino: string | undefined;
    if (od.includes('/')) {
      const [o, d] = od.split('/');
      origem = o?.trim()?.toUpperCase() || undefined;
      destino = d?.trim()?.toUpperCase() || undefined;
    } else if (od.trim()) {
      // se vier só um código, considere como origem
      origem = od.trim().toUpperCase();
    }

    const novo: Voo = {
      codigo: codigo.trim().toUpperCase(), // ex.: AD4518
      origem,
      destino,
      eta,
    };

    try {
      addVoo(novo); // atualiza serviço (StatusBarOperacao receberá via bus)
    } catch (e: any) {
      return Alert.alert('Aviso', e?.message || 'Não foi possível cadastrar o voo.');
    }

    // agenda alerta 15 minutos antes do ETA
    const trigger = new Date(eta.getTime() - 15 * 60 * 1000);
    await scheduleLocal(
      'Voo — Atenção',
      `Seu voo ${novo.codigo} estará em solo às ${hora}.`,
      trigger
    );

    setCodigo('');
    setOd('');
    setHora('');
    Alert.alert('Sucesso', `Voo ${novo.codigo} cadastrado.`);
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Acompanhar meus voos</Text>

      <Card>
        <Input
          label="Nº do voo"
          placeholder="Ex.: AD4518"
          value={codigo}
          onChangeText={setCodigo}
        />
        <Input
          label="Origem/Destino"
          placeholder="Ex.: REC/VCP (ou só REC)"
          value={od}
          onChangeText={setOd}
          autoCapitalize="characters"
        />
        <Input
          label="Hora (HH:MM)"
          placeholder="Ex.: 08:30"
          value={hora}
          onChangeText={setHora}
          keyboardType="numeric"
        />

        <Button title="Cadastrar voo" onPress={add} />
      </Card>

      <FlatList
        style={{ marginTop: 12 }}
        data={lista}
        keyExtractor={(i) => `${i.codigo}-${i.eta.getTime()}`}
        renderItem={({ item }) => {
          const HH = String(item.eta.getHours()).padStart(2, '0');
          const MM = String(item.eta.getMinutes()).padStart(2, '0');
          const odText =
            item.origem && item.destino
              ? `${item.origem}/${item.destino}`
              : item.origem || item.destino || '—';

          return (
            <Card>
              <Text style={s.row}>
                {item.codigo} — {odText} — {HH}:{MM}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
            Nenhum voo cadastrado.
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  row: { color: colors.text, fontWeight: '700' },
});
