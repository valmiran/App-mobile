import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { scheduleLocal, ensurePermission } from '../utils/notifications';

type ItemLL = {
  id: string; voo: string; data: string; local: string; descricao: string; pin: string; criadoEm: Date;
};

export default function LLScreen() {
  const [voo, setVoo] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [items, setItems] = useState<ItemLL[]>([]);

  async function add() {
    if (!voo || !data || !local || !descricao) return Alert.alert('Erro', 'Preencha todos os campos');
    const pin = 'PIN' + String(items.length + 1).padStart(4, '0');
    const novo: ItemLL = { id: String(Date.now()), voo, data, local, descricao, pin, criadoEm: new Date() };
    setItems((p) => [novo, ...p]);

    await ensurePermission();
    const trigger = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    await scheduleLocal('LL — Atenção', `Item ${pin} deve ser descartado ou enviado para LZ VCP.`, trigger);

    setVoo(''); setData(''); setLocal(''); setDescricao('');
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>LL — Propriedades Perdidas</Text>
      <Card>
        <Input label="Nº do voo" value={voo} onChangeText={setVoo}/>
        <Input label="Data do achado (YYYY-MM-DD)" value={data} onChangeText={setData}/>
        <Input label="Local encontrado" value={local} onChangeText={setLocal}/>
        <Input label="Descrição do item" value={descricao} onChangeText={setDescricao}/>
        <Button title="Adicionar" onPress={add}/>
      </Card>

      <FlatList
        style={{ marginTop: 12 }}
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={s.item}>{item.pin} — {item.voo} — {item.local}</Text>
            <Text style={s.sub}>{item.descricao}</Text>
          </Card>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  item: { color: colors.text, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 6 }
});
