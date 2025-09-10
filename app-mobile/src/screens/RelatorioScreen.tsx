import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../Theme/colors';
import Card from '../Components/Card';
import Button from '../Components/Button';

export default function RelatorioScreen() {
  function gerar() { alert('Relatório gerado (simulado).'); }
  return (
    <View style={s.container}>
      <Text style={s.title}>Relatório</Text>
      <Card>
        <Text style={{ color: colors.text, marginBottom: 10 }}>
          Gere a planilha/PDF da operação após preencher Malha e Voos.
        </Text>
        <Button title="Gerar relatório" onPress={gerar}/>
      </Card>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 }
});
