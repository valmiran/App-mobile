import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../Components/Input';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';

export default function PistaScreen() {
  const [corte, setCorte] = useState('17:30');
  const [decolagem, setDecolagem] = useState('18:35');
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const i = setInterval(()=> setNow(Date.now()), 1000); return ()=> clearInterval(i); }, []);

  function parse(hhmm: string) { const [H,M] = hhmm.split(':').map(Number); const d = new Date(); d.setHours(H,M,0,0); return d; }
  const tCorte = parse(corte); const tDec = parse(decolagem);
  const t9 = new Date(tDec.getTime() - 9*60*1000);
  const remainingMs = Math.max(0, t9.getTime() - now);
  const rm = Math.floor(remainingMs/60000), rs = Math.floor((remainingMs%60000)/1000);

  return (
    <View style={s.container}>
      <Text style={s.title}>Pista (MGT)</Text>
      <Card>
        <Input label="Horário de corte (HH:MM)" value={corte} onChangeText={setCorte}/>
        <Input label="Decolagem prevista (HH:MM)" value={decolagem} onChangeText={setDecolagem}/>
        <Text style={s.text}>Tempo até T-9: <Text style={s.bold}>{rm}m {rs}s</Text></Text>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  text: { color: colors.text, marginTop: 8 },
  bold: { fontWeight: '700' }
});
