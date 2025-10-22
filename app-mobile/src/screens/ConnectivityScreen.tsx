import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';

export default function ConnectivityScreen() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [network, setNetwork] = useState<{ type?: string; isConnected?: boolean; ip?: string }>({});

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Ative a permissão de localização para ver o GPS.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
  };

  const getNetwork = async () => {
    const state = await Network.getNetworkStateAsync();
    const ip = await Network.getIpAddressAsync();
    setNetwork({ type: state.type, isConnected: state.isConnected ?? undefined, ip });
  };

  useEffect(() => {
    getLocation();
    getNetwork();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>GPS</Text>
      <Text style={{ color: '#334155' }}>
        {coords ? `Lat: ${coords.lat.toFixed(6)}  |  Lon: ${coords.lon.toFixed(6)}` : 'Obtendo coordenadas...'}
      </Text>
      <TouchableOpacity onPress={getLocation} style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Atualizar GPS</Text>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 }} />

      <Text style={{ fontSize: 18, fontWeight: '700' }}>Rede / Wi-Fi</Text>
      <Text style={{ color: '#334155' }}>Tipo: {network.type ?? '—'}</Text>
      <Text style={{ color: '#334155' }}>Conectado: {network.isConnected ? 'Sim' : 'Não'}</Text>
      <Text style={{ color: '#334155' }}>IP: {network.ip ?? '—'}</Text>

      <Text style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
        Dica: por privacidade, SSID é limitado em muitos devices. Tipo de rede + IP já ajuda no diagnóstico.
      </Text>
    </View>
  );
}
