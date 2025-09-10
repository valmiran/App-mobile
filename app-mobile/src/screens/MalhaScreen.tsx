import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Components/Card';
import Table from '../Components/Table';
import { colors } from '../Theme/colors';

const COLUMNS = [
  "COI","VOO","ORIG","HOTRAN","ETA","DESEMB","CLTS","SSR","PREFIXO","BOX",
  "VOO2","DEST","HOTRAM","TRIP","GATE","PISTA","SSR2","CLTS2","LIDERDNATA","ANFRIT"
];

const ROWS = [
  { COI:"BRUNO", VOO:"2439", ORIG:"UDI", HOTRAN:"15:30", ETA:"15:30", DESEMB:"VICTOR", CLTS:"120", SSR:"02 INF", PREFIXO:"PS-ADA", BOX:"5",
    VOO2:"2483", DEST:"CGH", HOTRAM:"18:35", TRIP:"LOCAL", GATE:"10", PISTA:"VITOR E ALEXANDRE", SSR2:"0", CLTS2:"200", LIDERDNATA:"VICTOR", ANFRIT:"NADIA" },
  { COI:"BRUNO", VOO:"2500", ORIG:"VCP", HOTRAN:"15:30", ETA:"15:30", DESEMB:"VICTOR", CLTS:"240", SSR:"01 WCHR", PREFIXO:"PS-ADA", BOX:"3",
    VOO2:"2501", DEST:"VCP", HOTRAM:"18:35", TRIP:"TST", GATE:"11", PISTA:"PEDRO E BARRETO", SSR2:"0", CLTS2:"50", LIDERDNATA:"VICTOR", ANFRIT:"NADIA" },
  { COI:"BRUNO", VOO:"2507", ORIG:"RAO", HOTRAN:"15:30", ETA:"15:30", DESEMB:"VICTOR", CLTS:"78", SSR:"01 WEAP", PREFIXO:"PS-ADA", BOX:"4",
    VOO2:"2576", DEST:"CNF", HOTRAM:"18:35", TRIP:"TST", GATE:"8", PISTA:"ROBERTO E VICTORIA", SSR2:"0", CLTS2:"141", LIDERDNATA:"VICTOR", ANFRIT:"NADIA" },
  { COI:"BRUNO", VOO:"2466", ORIG:"SJP", HOTRAN:"15:30", ETA:"15:30", DESEMB:"VICTOR", CLTS:"145", SSR:"01 WCHS", PREFIXO:"PS-ADA", BOX:"2",
    VOO2:"2527", DEST:"VCP", HOTRAM:"18:35", TRIP:"TST", GATE:"9", PISTA:"PAULO E ANDERSON", SSR2:"0", CLTS2:"156", LIDERDNATA:"VICTOR", ANFRIT:"NADIA" },
];

export default function MalhaScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Malha de Atendimento</Text>
      <Card>
        <Text style={s.subtitle}>Encerramento: Luiz</Text>
        <Table columns={COLUMNS} rows={ROWS}/>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  subtitle: { color: colors.text, marginBottom: 10, fontWeight: '700' }
});
