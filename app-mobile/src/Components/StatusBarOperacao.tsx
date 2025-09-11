// src/Components/StatusBarOperacao.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Dimensions } from 'react-native';
import { colors } from '../Theme/colors';
import { onProcessosChange, listProcessos } from '../services/processos.service';
import { onVoosChange, listVoos } from '../services/voos.service';

const { width } = Dimensions.get('window');

export default function StatusBarOperacao() {
  // estados locais atualizados por serviços
  const [processos, setProcessos] = useState(() => listProcessos());
  const [voos, setVoos] = useState(() => listVoos());

  // assina mudanças
  useEffect(() => {
    const unsubP = onProcessosChange(setProcessos);
    const unsubV = onVoosChange(setVoos);
    return () => { unsubP(); unsubV(); };
  }, []);

  // métricas
  const { abertos, vencidos } = useMemo(() => {
    let a = 0, v = 0;
    for (const p of processos) {
      if (p.status === 'aberto') a++;
      if (p.status === 'vencido') v++;
    }
    return { abertos: a, vencidos: v };
  }, [processos]);

  const proximoVoo = useMemo(() => {
    const now = Date.now();
    const futuros = voos.filter(v => v.eta.getTime() >= now);
    if (!futuros.length) return null;
    futuros.sort((x, y) => x.eta.getTime() - y.eta.getTime());
    return futuros[0];
  }, [voos]);

  const texto = useMemo(() => {
    const partes = [
      `Processos: ${abertos} abertos / ${vencidos} vencidos`,
      `Voos: ${voos.length} cadastrados`,
    ];
    if (proximoVoo) {
      const hh = proximoVoo.eta.getHours().toString().padStart(2, '0');
      const mm = proximoVoo.eta.getMinutes().toString().padStart(2, '0');
      partes.push(`Próximo voo: ${proximoVoo.codigo} — ${hh}:${mm}`);
    } else {
      partes.push('Próximo voo: —');
    }
    return partes.join('   |   ');
  }, [abertos, vencidos, voos.length, proximoVoo]);

  // ====== animação marquee ======
  const animX = useRef(new Animated.Value(0)).current;
  const [textW, setTextW] = useState(width);

  useEffect(() => {
    animX.stopAnimation();
    animX.setValue(width);
    Animated.loop(
      Animated.timing(animX, {
        toValue: -textW,
        duration: Math.max(8000, (width + textW) * 15), // velocidade proporcional
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [texto, textW]);

  return (
    <View style={s.wrap}>
      <Animated.Text
        onLayout={e => setTextW(e.nativeEvent.layout.width)}
        style={[s.txt, { transform: [{ translateX: animX }] }]}
        numberOfLines={1}
      >
        {texto}
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#111827',
    overflow: 'hidden',
    height: 28,
    justifyContent: 'center',
  },
  txt: {
    color: colors.text,
    fontSize: 12,
    paddingHorizontal: 12,
  },
});
