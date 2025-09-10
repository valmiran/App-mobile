import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { scheduleLocal } from '../utils/notifications';
import { addFlight, Voo } from '../services/voos.service';

export default function VoosScreen() {
  const [code, setCode] = useState('');
  const [od, setOd] = useState('');
  const [hora, setHora] = useState('');
  const [lista, setLista] = useState<Voo[]>([]);

  async function add() {
    if (!code || !od || !hora) return Alert.alert('Erro', 'Preencha código, origem/destino e hora (HH:MM)');
    const v: Voo = { id: String(Date.now()), code, origemOuDest: od, hora };
    setLista((p)=> [v, ...p]);
    addFlight(v); // alimenta serviço para o header mostrar "Próximo voo"

    // agenda alerta 15 minutos antes
    const [H, M] = hora.split(':').map(Number);
    const target = new Date(); target.setHours(H, M, 0, 0);
    const trigger = new Date(target.getTime() - 15*60*1000);
    await scheduleLocal('Voo — Atenção', `Seu voo ${code} estará em solo às ${hora}.`, trigger);

    setCode(''); setOd(''); setHora('');
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Acompanhar meus voos</Text>
      <Card>
        <Input label="Nº do voo" value={code} onChangeText={setCode}/>
        <Input label="Origem/Destino (ex: REC/VCP)" value={od} onChangeText={setOd}/>
        <Input label="Hora (HH:MM)" value={hora} onChangeText={setHora} keyboardType="numeric"/>
        <Button title="Cadastrar voo" onPress={add}/>
      </Card>

      <FlatList
        style={{ marginTop: 12 }}
        data={lista}
        keyExtractor={i=> i.id}
        renderItem={({ item }) => (
          <Card><Text style={{ color: colors.text, fontWeight: '700' }}>{item.code} — {item.origemOuDest} — {item.hora}</Text></Card>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 }
});
