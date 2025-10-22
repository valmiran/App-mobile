import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ItemCard from '../Components/ItemCard';
import { ITEMS, type Item as LocalItem } from '../data/items';
import { colors } from '../Theme/colors';

// Tipos que podem vir da API
type VooAPI = {
  id: number | string;
  codigo_voo: string;
  origem: string;
  destino: string;
  data?: string;
};

type ProcessoAPI = {
  id: number | string;
  descricao: string;
  data?: string;
};

// Tipo união para a lista (dados locais OU dados da API)
type ListItem = LocalItem | VooAPI | ProcessoAPI;

export default function ItemsScreen() {
  // Começa com os dados locais (demonstração), mas pode ser substituído pelo backend
  const [data, setData] = useState<ListItem[]>(ITEMS);
  const [loading, setLoading] = useState(false);

  // Troque pelo IP do seu backend Django
  const API_URL = 'http://192.168.0.3:8000/api/voos/';

  const buscarDados = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ListItem[]>(API_URL);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      alert('⚠️ Não foi possível carregar os dados do servidor. Mostrando lista local.');
      setData(ITEMS); // fallback
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar cada item, tratando as 3 possibilidades
  const renderItem = ({ item }: { item: ListItem }) => {
    // Se vier da API de voo
    if ('codigo_voo' in item) {
      return (
        <View style={s.card}>
          <Text style={s.cardTitle}>{item.codigo_voo}</Text>
          <Text style={s.cardSubtitle}>{item.origem} → {item.destino}</Text>
          {!!item.data && <Text style={s.cardDate}>{item.data}</Text>}
        </View>
      );
    }

    // Se vier da API de processo
    if ('descricao' in item && !('codigo_voo' in item)) {
      return (
        <View style={s.card}>
          <Text style={s.cardTitle}>Processo {String(item.id)}</Text>
          <Text style={s.cardSubtitle}>{item.descricao}</Text>
          {!!item.data && <Text style={s.cardDate}>{item.data}</Text>}
        </View>
      );
    }

    // Caso contrário, é o item local (mock)
    return <ItemCard item={item as LocalItem} />;
  };

  // keyExtractor que funciona para todos os formatos
  const keyExtractor = (item: ListItem) => {
    if ('id' in item && item.id != null) return String(item.id);
    // fallback seguro (não ideal, mas evita crash)
    return Math.random().toString();
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <Text style={[s.title, { color: colors.text }]}>Listagem de Voos e Processos</Text>

      {/* Botão Buscar */}
      <TouchableOpacity
        style={[s.button, { backgroundColor: colors.primary }]}
        onPress={buscarDados}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Buscar</Text>}
      </TouchableOpacity>

      {/* FlatList principal */}
      <FlatList<ListItem>
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={() => (
          !loading ? (
            <Text style={{ color: colors.muted ?? '#94a3b8', marginTop: 20, textAlign: 'center' }}>
              Nenhum dado encontrado. Toque em "Buscar" para carregar.
            </Text>
          ) : null
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    backgroundColor: '#0B1220',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  cardSubtitle: { color: colors.text, fontSize: 14, marginTop: 2 },
  cardDate: { color: colors.muted ?? '#94a3b8', fontSize: 12, marginTop: 4 },
});
