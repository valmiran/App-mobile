import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors } from '../Theme/colors';

type Row = Record<string, string|number>;

export default function Table({ columns, rows }: { columns: string[]; rows: Row[] }) {
  return (
    <ScrollView horizontal style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}>
      <View>
        <View style={[s.row, { backgroundColor: '#0B1220' }]}>
          {columns.map((c) => <Text key={c} style={[s.cell, s.header]}>{c}</Text>)}
        </View>
        {rows.map((r, i) => (
          <View key={i} style={s.row}>
            {columns.map((c) => <Text key={c} style={s.cell}>{String(r[c] ?? '')}</Text>)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  cell: { minWidth: 90, paddingVertical: 8, paddingHorizontal: 10, color: colors.text },
  header: { fontWeight: '700' }
});
