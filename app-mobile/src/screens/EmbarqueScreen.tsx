import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { scheduleLocal } from '../utils/notifications';

export default function EmbarqueScreen() {
  const [partida, setPartida] = useState<string>('18:35'); // HH:MM
  const [running, setRunning] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const startRef = useRef<number | null>(null); // ✅ valor inicial

  function start() {
    if (running) return;
    setElapsed(0);
    setRunning(true);
    startRef.current = Date.now();

    // alertas T-20 e T-10
    const [H, M] = partida.split(':').map(Number);
    const target = new Date(); target.setHours(H, M, 0, 0);
    scheduleLocal('Embarque — Atenção', 'Finalizar embarque o quanto antes (T-20).', new Date(target.getTime() - 20*60*1000));
    scheduleLocal('Embarque — Urgente', 'Finalizar embarque agora (T-10).', new Date(target.getTime() - 10*60*1000));
  }

  function stop() { setRunning(false); }

  useEffect(() => {
    const i = setInterval(() => {
      if (!running || !startRef.current) return;
      setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(i);
  }, [running]);

  const [H, M] = partida.split(':').map(Number);
  const prevista = new Date(); prevista.setHours(H, M, 0, 0);
  const estourou = running && Date.now() > prevista.getTime();

  return (
    <View style={s.container}>
      <Text style={s.title}>Embarque</Text>
      <Card>
        <Input label="Partida prevista (HH:MM)" value={partida} onChangeText={setPartida}/>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Iniciar" onPress={start}/>
          <Button title="Finalizar" onPress={stop}/>
        </View>
        <Text style={[s.timer, estourou && { color: colors.danger }]}>
          Tempo: {Math.floor(elapsed/60000)}m {Math.floor((elapsed%60000)/1000)}s
        </Text>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  timer: { color: colors.text, marginTop: 12, fontWeight: '700' }
});
