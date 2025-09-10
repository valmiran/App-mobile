// src/components/StatusBarOperacao.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { colors } from '../Theme/colors';
import { getSummary, subscribeProcessSummary } from '../services/processos.service';
import { getNextFlightLabel, subscribeNextFlight } from '../services/voos.service';

export default function StatusBarOperacao() {
  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(screenWidth)).current;

  const [abertos, setAbertos] = useState(0);
  const [vencidos, setVencidos] = useState(0);
  const [proximo, setProximo] = useState<string | null>(null);

  function refresh() {
    const { abertos, vencidos } = getSummary();
    setAbertos(abertos);
    setVencidos(vencidos);
    setProximo(getNextFlightLabel());
  }

  useEffect(() => {
    // assina mudanças
    const u1 = subscribeProcessSummary(refresh);
    const u2 = subscribeNextFlight(refresh);
    // primeira carga
    refresh();

    return () => { u1(); u2(); };
  }, []);

  useEffect(() => {
    const loop = () => {
      translateX.setValue(screenWidth);
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 10000, // 10s para atravessar
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [screenWidth, translateX, abertos, vencidos, proximo]);

  const msg = `🛄 Processos: ${abertos} abertos / ${vencidos} vencidos   ${proximo ? `✈️ Próximo voo: ${proximo}` : ''}`;

  return (
    <View style={s.statusContainer}>
      <Animated.Text style={[s.statusText, { transform: [{ translateX }] }]}>
        {msg}
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  statusContainer: {
    backgroundColor: '#111827',
    height: 24,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
