import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MailComposer from 'expo-mail-composer';
import * as Location from 'expo-location';
import * as Network from 'expo-network';

const SECURITY_EMAIL = 'valmiran014@gmail.com'; // <-- troque pelo e-mail real

export default function AQDReportScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [sending, setSending] = useState(false);

  // estados para GPS e rede
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [netInfo, setNetInfo] = useState<{ type?: string; ip?: string }>({});

  // solicita permissão da câmera
  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  // coleta localização e rede automaticamente
  useEffect(() => {
    (async () => {
      try {
        // localização
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }

        // rede
        const state = await Network.getNetworkStateAsync();
        const ip = await Network.getIpAddressAsync();
        setNetInfo({ type: state.type ?? undefined, ip });
      } catch {
        console.warn('Falha ao obter localização ou rede.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7, base64: false });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const sendEmail = async () => {
    if (!photoUri) return Alert.alert('Atenção', 'Tire uma foto antes de enviar.');
    if (!desc.trim()) return Alert.alert('Atenção', 'Inclua uma descrição do ocorrido.');

    try {
      setSending(true);
      const ok = await MailComposer.isAvailableAsync();
      if (!ok) {
        setSending(false);
        return Alert.alert('Erro', 'Cliente de e-mail não disponível no dispositivo.');
      }

      // Monta texto com localização e rede
      const gpsLine =
        coords.lat && coords.lon
          ? `GPS: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`
          : 'GPS: não disponível';
      const netLine = `Rede: ${netInfo.type ?? 'n/d'} | IP: ${netInfo.ip ?? 'n/d'}`;

      // Abre e-mail pronto
      await MailComposer.composeAsync({
        recipients: [SECURITY_EMAIL],
        subject: 'AQD - Reporte de Segurança',
        body: `Descrição do ocorrido:\n\n${desc}\n\n${gpsLine}\n${netLine}\n\n(Enviado via app)`,
        attachments: [photoUri],
      });

      Alert.alert('Sucesso', 'E-mail preparado. Verifique seu app de e-mail para enviar.');
      setDesc('');
      setPhotoUri(null);
    } catch {
      Alert.alert('Erro', 'Falha ao preparar o e-mail.');
    } finally {
      setSending(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ textAlign: 'center', marginBottom: 12 }}>
          Precisamos da permissão da câmera para capturar evidências.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12, gap: 12, backgroundColor: '#f8fafc' }}>
      {!photoUri ? (
        <View style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
          <CameraView ref={cameraRef} facing="back" style={{ flex: 1 }} />
        </View>
      ) : (
        <Image source={{ uri: photoUri }} style={{ flex: 1, borderRadius: 12 }} resizeMode="cover" />
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={takePhoto}
          style={{ flex: 1, backgroundColor: '#0ea5e9', padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
            {photoUri ? 'Refazer foto' : 'Tirar foto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPhotoUri(null)}
          style={{ padding: 12, borderRadius: 10, backgroundColor: '#475569' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Descrição do incidente (obrigatório)"
        value={desc}
        onChangeText={setDesc}
        multiline
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 12,
          minHeight: 80,
          textAlignVertical: 'top',
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      />

      <TouchableOpacity
        onPress={sendEmail}
        disabled={sending}
        style={{
          backgroundColor: sending ? '#94a3b8' : '#16a34a',
          padding: 14,
          borderRadius: 12,
        }}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
            Enviar para Segurança
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
