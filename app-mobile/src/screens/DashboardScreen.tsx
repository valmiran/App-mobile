import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../Theme/colors';

export default function DashboardScreen({ navigation }: any) {
  const items = [
    { label: 'LL', route: 'LL' },
    { label: 'Processos', route: 'Processos' },
    { label: 'Voos', route: 'Voos' },
    { label: 'Embarque', route: 'Operações' },
    { label: 'Pista', route: 'Operações' },
    { label: 'Malha', route: 'Malha' },
  ];

  return (
    <View style={s.container}>
      <Text style={s.title}>Dashboard Geral</Text>
      <View style={s.grid}>
        {items.map(i => (
          <TouchableOpacity key={i.label} style={s.item} onPress={() => navigation.navigate(i.route)}>
            <Text style={s.itemText}>{i.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { backgroundColor: '#0B1220', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, minWidth: '45%' },
  itemText: { color: colors.text, textAlign: 'center', fontWeight: '700' }
});
