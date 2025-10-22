import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../Theme/colors';

export default function DashboardScreen({ navigation }: any) {
  // Tema com fallbacks seguros
  const THEME = {
    bg: colors.bg,
    text: colors.text,
    border: colors.border,
    card: (colors as any).card ?? '#0B1220',
    primary: (colors as any).primary ?? '#2563eb',
    info: (colors as any).info ?? '#0ea5e9',
    success: (colors as any).success ?? '#22c55e',
  };

  const items = [
    { label: 'LL', route: 'LL' },
    { label: 'Processos', route: 'Processos' },
    { label: 'Voos', route: 'Voos' },
    { label: 'Embarque', route: 'Operações' },
    { label: 'Pista', route: 'Operações' },
    { label: 'Malha', route: 'Malha' },
  ];

  return (
    <View style={[s.container, { backgroundColor: THEME.bg }]}>
      <Text style={[s.title, { color: THEME.text }]}>Dashboard Geral</Text>

      {/* grade existente */}
      <View style={s.grid}>
        {items.map(i => (
          <TouchableOpacity
            key={i.label}
            style={[
              s.item,
              { backgroundColor: THEME.card, borderColor: THEME.border }
            ]}
            onPress={() => navigation.navigate(i.route)}
          >
            <Text style={[s.itemText, { color: THEME.text }]}>{i.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* seção nova */}
      <View style={s.sectionTitleWrap}>
        <Text style={[s.sectionTitle, { color: THEME.text }]}>
          Recursos do Projeto
        </Text>
      </View>

      <View style={s.quickActions}>
        {/* Ir para: Tab "Operações" -> Stack interno com a tela desejada */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Operações', { screen: 'Items' })}
          style={[s.qaBtn, { backgroundColor: THEME.primary }]}
        >
          <Text style={s.qaText}>Listagem (FlatList)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Operações', { screen: 'AQDReport' })}
          style={[s.qaBtn, { backgroundColor: THEME.info }]}
        >
          <Text style={s.qaText}>AQD – Reporte de Segurança</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Operações', { screen: 'Connectivity' })}
          style={[s.qaBtn, { backgroundColor: THEME.success }]}
        >
          <Text style={s.qaText}>Conectividade (GPS/Rede)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '45%',
  },
  itemText: { textAlign: 'center', fontWeight: '700' },

  sectionTitleWrap: { marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  quickActions: { gap: 10 },
  qaBtn: { padding: 12, borderRadius: 10 },
  qaText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
