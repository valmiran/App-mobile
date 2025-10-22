import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../Theme/colors';

import { listVoos, onVoosChange, type Voo } from '../services/voos.service';
import * as ProcessosService from '../services/processos.service';

type ProcessoLike = {
  numero?: string;
  tipo?: string;
  status?: string;
  criadoEm?: Date | string | number;
  descricao?: string;
  origem?: string;
  destino?: string;
};

type UnifiedItem = {
  id: string;
  kind: 'voo' | 'processo';
  title: string;
  subtitle: string;
  dateOrder: number;
  right?: string;
  _vooCodigo?: string;
  _vooEtaMs?: number;
  _procNumero?: string;
};

export default function ItemsScreen() {
  const [voos, setVoos] = useState<Voo[]>([]);
  const [processos, setProcessos] = useState<ProcessoLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');

  const norm = (v?: any) => String(v ?? '').toLowerCase().trim();

  const safeTime = (d: Date | string | number | undefined): number => {
    if (!d) return 0;
    try {
      if (d instanceof Date) return d.getTime();
      const dt = new Date(d as any);
      return isNaN(dt.getTime()) ? 0 : dt.getTime();
    } catch {
      return 0;
    }
  };

  const asProcessosArray = (): ProcessoLike[] => {
    try {
      if (typeof (ProcessosService as any).listProcessos === 'function') {
        return (ProcessosService as any).listProcessos() as ProcessoLike[];
      }
      if (typeof (ProcessosService as any).getAll === 'function') {
        return (ProcessosService as any).getAll() as ProcessoLike[];
      }
      return [];
    } catch {
      return [];
    }
  };

  const buscarDados = async () => {
    try {
      setLoading(true);
      setVoos(listVoos());
      setProcessos(asProcessosArray());
      setSearched(query.trim());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubVoos = onVoosChange?.((all: Voo[]) => setVoos(all)) ?? (() => {});
    let unsubProc = () => {};
    const onProc = (ProcessosService as any).onProcessosChange;
    if (typeof onProc === 'function') {
      unsubProc = onProc((all: ProcessoLike[]) => setProcessos(all));
    }
    buscarDados();
    return () => {
      unsubVoos();
      unsubProc();
    };
  }, []);

  const itens: UnifiedItem[] = useMemo(() => {
    const q = norm(searched);

    const vooItems: UnifiedItem[] = voos
      .map((v) => {
        const HH = String(v.eta.getHours()).padStart(2, '0');
        const MM = String(v.eta.getMinutes()).padStart(2, '0');
        const od =
          v.origem && v.destino ? `${v.origem}/${v.destino}` : v.origem || v.destino || '—';
        return {
          id: `voo:${v.codigo}:${v.eta.getTime()}`,
          kind: 'voo' as const,
          title: `✈️ ${v.codigo}`,
          subtitle: od,
          dateOrder: v.eta.getTime(),
          right: `${HH}:${MM}`,
          _vooCodigo: v.codigo,
          _vooEtaMs: v.eta.getTime(),
        };
      })
      .filter((it) => {
        if (!q) return true;
        return norm(it._vooCodigo).includes(q) || norm(it.subtitle).includes(q);
      });

    const procItems: UnifiedItem[] = processos
      .map((p, idx) => {
        const created = safeTime(p.criadoEm);
        const title = `📦 ${p.numero ?? `PROC-${idx + 1}`}`;
        const subt = p.descricao
          ? String(p.descricao)
          : p.origem && p.destino
          ? `${p.origem} → ${p.destino}`
          : p.tipo
          ? String(p.tipo)
          : 'Processo';
        return {
          id: `proc:${p.numero ?? idx}`,
          kind: 'processo' as const,
          title,
          subtitle: subt,
          dateOrder: created || Date.now() - idx,
          right: p.status ? String(p.status).toUpperCase() : undefined,
          _procNumero: p.numero,
        };
      })
      .filter((it) => {
        if (!q) return true;
        return (
          norm(it._procNumero).includes(q) ||
          norm(it.subtitle).includes(q) ||
          norm(it.title).includes(q)
        );
      });

    return [...vooItems, ...procItems].sort((a, b) => b.dateOrder - a.dateOrder);
  }, [voos, processos, searched]);

  const handleSelect = (item: UnifiedItem) => {
    if (item.kind === 'voo') {
      const v = voos.find(
        (x) => x.codigo === item._vooCodigo && x.eta.getTime() === item._vooEtaMs
      );
      if (!v) return;
      const HH = String(v.eta.getHours()).padStart(2, '0');
      const MM = String(v.eta.getMinutes()).padStart(2, '0');
      const rota =
        v.origem && v.destino ? `${v.origem}/${v.destino}` : v.origem || v.destino || '—';
      Alert.alert(`Voo ${v.codigo}`, `Rota: ${rota}\nETA: ${HH}:${MM}`);
      return;
    }

    const p =
      processos.find((x) => x.numero && x.numero === item._procNumero) ??
      processos.find((_, idx) => item.id === `proc:${idx}`);
    if (!p) return;
    Alert.alert(
      `Processo ${p.numero ?? ''}`.trim() || 'Processo',
      [
        p.tipo ? `Tipo: ${p.tipo}` : '',
        p.status ? `Status: ${p.status}` : '',
        p.origem && p.destino ? `Rota: ${p.origem} → ${p.destino}` : '',
        p.descricao ? `Descrição: ${p.descricao}` : '',
      ]
        .filter(Boolean)
        .join('\n') || 'Sem detalhes.'
    );
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <Text style={[s.subtitle, { color: colors.text }]}>Listagem de Voos e Processos</Text>

      <View style={s.searchRow}>
        <TextInput
          placeholder="Digite Nº do processo ou do voo (ex.: MCZAD17656 ou AD4518)"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          style={s.searchInput}
        />
        <TouchableOpacity
          style={[s.button, { backgroundColor: colors.primary }]}
          onPress={buscarDados}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Buscar</Text>}
        </TouchableOpacity>
      </View>

      <FlatList<UnifiedItem>
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.9}>
            <View style={s.card}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSubtitle}>{item.subtitle}</Text>
              </View>
              {item.right && <Text style={s.cardRight}>{item.right}</Text>}
              <View
                style={[
                  s.chip,
                  {
                    backgroundColor:
                      item.kind === 'voo' ? colors.primary : '#1e293b',
                    borderColor: item.kind === 'voo' ? colors.primary : '#334155',
                  },
                ]}
              >
                <Text style={s.chipText}>
                  {item.kind === 'voo' ? 'Voo' : 'Processo'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() =>
          loading ? null : (
            <Text style={s.emptyText}>
              Nada para exibir. Digite o número e toque em “Buscar”.
            </Text>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  searchInput: {
    flex: 1,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: colors.text,
    height: 44,
  },
  button: {
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  cardSubtitle: { color: '#94a3b8', fontSize: 14, marginTop: 2 },
  cardRight: { color: '#e2e8f0', fontWeight: '700', fontSize: 13 },
  chip: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyText: {
    color: '#94a3b8',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});
