import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Input from '../Components/Input';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { colors } from '../Theme/colors';
import { scheduleLocal } from '../utils/notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  addVoo,
  listVoos,
  onVoosChange,
  type Voo,
} from '../services/voos.service';

// --- util: cria uma Date hoje a partir de "HH:MM" ---
function dateTodayAt(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const [_, HH, MM] = m;
  const d = new Date();
  d.setHours(Number(HH), Number(MM), 0, 0);
  return d;
}

// dias de um mês específico
function getDaysInMonth(year: number, monthZeroBased: number) {
  const last = new Date(year, monthZeroBased + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) => i + 1);
}

type TripType = 'roundtrip' | 'oneway';

type Payment = {
  id: string;
  tipo: 'Crédito' | 'Débito' | 'PIX';
  valor: number;
  bandeira?: string;
  cardLast4?: string;
  parcelas?: number;
};

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function VoosScreen() {
  // ------------------ ESTADO DA PARTE DE VOOS ------------------
  const [codigo, setCodigo] = useState('');
  const [od, setOd] = useState('');
  const [hora, setHora] = useState('');
  const [lista, setLista] = useState<Voo[]>(() => listVoos());

  useEffect(() => {
    const unsub = onVoosChange(setLista);
    return unsub;
  }, []);

  async function add() {
    if (!codigo || !hora) {
      return Alert.alert('Erro', 'Preencha o código do voo e a hora (HH:MM).');
    }

    const eta = dateTodayAt(hora);
    if (!eta) {
      return Alert.alert('Erro', 'Hora inválida. Use o formato HH:MM (ex.: 08:30).');
    }

    let origem: string | undefined;
    let destino: string | undefined;
    if (od.includes('/')) {
      const [o, d] = od.split('/');
      origem = o?.trim()?.toUpperCase() || undefined;
      destino = d?.trim()?.toUpperCase() || undefined;
    } else if (od.trim()) {
      origem = od.trim().toUpperCase();
    }

    const novo: Voo = {
      codigo: codigo.trim().toUpperCase(),
      origem,
      destino,
      eta,
    };

    try {
      addVoo(novo);
    } catch (e: any) {
      return Alert.alert('Aviso', e?.message || 'Não foi possível cadastrar o voo.');
    }

    const trigger = new Date(eta.getTime() - 15 * 60 * 1000);
    await scheduleLocal(
      'Voo — Atenção',
      `Seu voo ${novo.codigo} estará em solo às ${hora}.`,
      trigger,
    );

    setCodigo('');
    setOd('');
    setHora('');
    Alert.alert('Sucesso', `Voo ${novo.codigo} cadastrado.`);
  }

  // ------------------ ESTADO DA COMPRA DE PASSAGENS ------------------
  const [showPurchase, setShowPurchase] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tripType, setTripType] = useState<TripType>('roundtrip');

  const [dateDeparture, setDateDeparture] = useState<string | null>(null);
  const [dateReturn, setDateReturn] = useState<string | null>(null);
  const [openCalendarFor, setOpenCalendarFor] = useState<'departure' | 'return' | null>(null);

  const [adt, setAdt] = useState(1);
  const [chd, setChd] = useState(0);

  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentType, setPaymentType] = useState<'Crédito' | 'Débito' | 'PIX'>('Crédito');
  const [paymentAmount, setPaymentAmount] = useState('');

  // dados extras de pagamento
  const [creditBrand, setCreditBrand] = useState<string | null>(null);
  const [debitBrand, setDebitBrand] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [installments, setInstallments] = useState('');

  const [locator, setLocator] = useState<string | null>(null);

  // ---- calendário com meses até maio do ano que vem ----
  const today = new Date();
  const nextYear = today.getFullYear() + 1;
  const MIN_YEAR = today.getFullYear();
  const MIN_MONTH = today.getMonth(); // 0–11
  const MAX_YEAR = nextYear;
  const MAX_MONTH = 4; // maio (0-based)

  const [calYear, setCalYear] = useState(MIN_YEAR);
  const [calMonth, setCalMonth] = useState(MIN_MONTH);

  const daysOfMonth = getDaysInMonth(calYear, calMonth);

  const totalPaid = payments.reduce((sum, p) => sum + p.valor, 0);
  const remaining = totalValue ? Math.max(totalValue - totalPaid, 0) : 0;

  function isBeforeToday(year: number, monthZero: number, day: number) {
    const candidate = new Date(year, monthZero, day, 0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return candidate.getTime() < t.getTime();
  }

  function handleSelectDay(day: number) {
    // valida faixa de datas (>= hoje e <= maio do ano que vem)
    if (isBeforeToday(calYear, calMonth, day)) {
      return Alert.alert('Atenção', 'Não é possível selecionar datas passadas.');
    }
    if (
      calYear > MAX_YEAR ||
      (calYear === MAX_YEAR && calMonth > MAX_MONTH)
    ) {
      return Alert.alert('Atenção', 'Data acima do limite permitido.');
    }

    const dd = String(day).padStart(2, '0');
    const mm = String(calMonth + 1).padStart(2, '0');
    const yyyy = String(calYear);
    const formatted = `${dd}/${mm}/${yyyy}`;

    if (openCalendarFor === 'departure') {
      setDateDeparture(formatted);
    } else if (openCalendarFor === 'return') {
      setDateReturn(formatted);
    }

    setOpenCalendarFor(null);
  }

  function goPrevMonth() {
    let y = calYear;
    let m = calMonth - 1;
    if (m < 0) {
      m = 11;
      y = y - 1;
    }
    // não deixar antes do mês/ano mínimo
    if (y < MIN_YEAR || (y === MIN_YEAR && m < MIN_MONTH)) return;
    setCalYear(y);
    setCalMonth(m);
  }

  function goNextMonth() {
    let y = calYear;
    let m = calMonth + 1;
    if (m > 11) {
      m = 0;
      y = y + 1;
    }
    // não deixar depois de maio do ano que vem
    if (y > MAX_YEAR || (y === MAX_YEAR && m > MAX_MONTH)) return;
    setCalYear(y);
    setCalMonth(m);
  }

  function openCalendar(target: 'departure' | 'return') {
    setOpenCalendarFor((current) => (current === target ? null : target));
    // opcional: resetar para mês atual quando abrir
    setCalYear(MIN_YEAR);
    setCalMonth(MIN_MONTH);
  }

  function simulatePrice() {
    if (!from.trim() || !to.trim()) {
      return Alert.alert('Atenção', 'Preencha origem e destino.');
    }
    if (!dateDeparture) {
      return Alert.alert('Atenção', 'Informe a data de partida.');
    }
    if (tripType === 'roundtrip' && !dateReturn) {
      return Alert.alert('Atenção', 'Informe a data de retorno.');
    }
    if (adt + chd <= 0) {
      return Alert.alert('Atenção', 'Informe pelo menos 1 passageiro.');
    }

    const baseAdult = 800;
    const baseChild = 500;
    const segments = tripType === 'roundtrip' ? 2 : 1;

    const total =
      segments * (adt * baseAdult + chd * baseChild);

    setTotalValue(total);
    setPayments([]);
    setLocator(null);
    Alert.alert('Simulação concluída', `Valor estimado: R$ ${total.toFixed(2)}`);
  }

  function sanitizeDigits(text: string) {
    return text.replace(/[^0-9]/g, '');
  }

  function addPayment() {
    if (!totalValue) {
      return Alert.alert('Atenção', 'Simule o valor antes de adicionar pagamentos.');
    }

    const rawAmount = paymentAmount.replace(',', '.');
    const v = parseFloat(rawAmount);
    if (!v || v <= 0) {
      return Alert.alert('Atenção', 'Informe um valor de pagamento válido.');
    }
    if (v > remaining) {
      return Alert.alert('Atenção', 'Valor maior que o restante a pagar.');
    }

    let extra: Partial<Payment> = {};

    if (paymentType === 'Crédito') {
      if (!creditBrand) {
        return Alert.alert('Atenção', 'Selecione a bandeira do cartão de crédito.');
      }
      const onlyDigits = sanitizeDigits(cardNumber);
      if (onlyDigits.length !== 4) {
        return Alert.alert('Atenção', 'Informe os 4 últimos dígitos do cartão de crédito.');
      }

      const parcelasNum = parseInt(installments || '0', 10);
      if (!parcelasNum || parcelasNum < 1 || parcelasNum > 15) {
        return Alert.alert(
          'Atenção',
          'Número de parcelas inválido. Use de 1 a 15 parcelas.',
        );
      }

      if (parcelasNum > 10) {
        Alert.alert(
          'Informação',
          'Compras acima de 10x são consideradas com juros (simulação).',
        );
      }

      extra = {
        bandeira: creditBrand,
        cardLast4: onlyDigits,
        parcelas: parcelasNum,
      };
    } else if (paymentType === 'Débito') {
      if (!debitBrand) {
        return Alert.alert('Atenção', 'Selecione a bandeira do cartão de débito.');
      }
      const onlyDigits = sanitizeDigits(cardNumber);
      if (onlyDigits.length !== 4) {
        return Alert.alert('Atenção', 'Informe os 4 últimos dígitos do cartão de débito.');
      }

      extra = {
        bandeira: debitBrand,
        cardLast4: onlyDigits,
      };
    } else {
      // PIX não exige cartão
    }

    const newPayment: Payment = {
      id: `${Date.now()}-${Math.random()}`,
      tipo: paymentType,
      valor: v,
      ...extra,
    };

    setPayments((old) => [...old, newPayment]);
    setPaymentAmount('');
    setCardNumber('');
    setInstallments('');
  }

  function removePayment(id: string) {
    setPayments((old) => old.filter((p) => p.id !== id));
  }

  function generateLocator() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let loc = '';
    for (let i = 0; i < 6; i++) {
      loc += chars[Math.floor(Math.random() * chars.length)];
    }
    return loc;
  }

  function finalizePurchase() {
    if (!totalValue) {
      return Alert.alert('Atenção', 'Simule o valor antes de finalizar.');
    }
    if (remaining > 0) {
      return Alert.alert('Atenção', 'Ainda há valor pendente de pagamento.');
    }
    const loc = generateLocator();
    setLocator(loc);
    Alert.alert('Compra concluída', `Localizador: ${loc}`);
  }

  function changePassengers(kind: 'adt' | 'chd', dir: 'inc' | 'dec') {
    if (kind === 'adt') {
      setAdt((v) => {
        const next = dir === 'inc' ? v + 1 : v - 1;
        return next < 0 ? 0 : next;
      });
    } else {
      setChd((v) => {
        const next = dir === 'inc' ? v + 1 : v - 1;
        return next < 0 ? 0 : next;
      });
    }
  }

  // ------------------ RENDER ------------------
  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
    >
      <Text style={s.title}>Acompanhar meus voos</Text>

      {/* CARD DE CADASTRO DE VOO */}
      <Card>
        <Input
          label="Nº do voo"
          placeholder="Ex.: AD4518"
          value={codigo}
          onChangeText={setCodigo}
        />
        <Input
          label="Origem/Destino"
          placeholder="Ex.: REC/VCP (ou só REC)"
          value={od}
          onChangeText={setOd}
          autoCapitalize="characters"
        />
        <Input
          label="Hora (HH:MM)"
          placeholder="Ex.: 08:30"
          value={hora}
          onChangeText={setHora}
          keyboardType="default"
        />

        <Button title="Cadastrar voo" onPress={add} />
      </Card>

      {/* LISTA DE VOOS CADASTRADOS */}
      <FlatList
        style={{ marginTop: 12 }}
        data={lista}
        scrollEnabled={false}
        keyExtractor={(i) => `${i.codigo}-${i.eta.getTime()}`}
        renderItem={({ item }) => {
          const HH = String(item.eta.getHours()).padStart(2, '0');
          const MM = String(item.eta.getMinutes()).padStart(2, '0');
          const odText =
            item.origem && item.destino
              ? `${item.origem}/${item.destino}`
              : item.origem || item.destino || '—';

          return (
            <Card>
              <Text style={s.row}>
                {item.codigo} — {odText} — {HH}:{MM}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
            Nenhum voo cadastrado.
          </Text>
        }
      />

      {/* SEÇÃO DE COMPRA DE PASSAGENS */}
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity
          style={s.buyButton}
          onPress={() => setShowPurchase((v) => !v)}
        >
          <MaterialCommunityIcons name="bag-checked" size={20} color="#fff" />
          <Text style={s.buyButtonText}>Comprar</Text>
          <MaterialCommunityIcons
            name={showPurchase ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {showPurchase && (
          <Card>
            {/* ORIGEM / DESTINO + TIPO DE VIAGEM */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Simular compra de passagem</Text>
            </View>

            <View style={s.tripTypeRow}>
              <TouchableOpacity
                style={[
                  s.tripTypeChip,
                  tripType === 'roundtrip' && s.tripTypeChipActive,
                ]}
                onPress={() => setTripType('roundtrip')}
              >
                <Text
                  style={[
                    s.tripTypeChipText,
                    tripType === 'roundtrip' && s.tripTypeChipTextActive,
                  ]}
                >
                  Ida e volta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.tripTypeChip,
                  tripType === 'oneway' && s.tripTypeChipActive,
                ]}
                onPress={() => setTripType('oneway')}
              >
                <Text
                  style={[
                    s.tripTypeChipText,
                    tripType === 'oneway' && s.tripTypeChipTextActive,
                  ]}
                >
                  Somente ida
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Saindo de</Text>
                <Input
                  label=""
                  placeholder="Ex.: MCZ"
                  value={from}
                  onChangeText={setFrom}
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Chegando em</Text>
                <Input
                  label=""
                  placeholder="Ex.: REC"
                  value={to}
                  onChangeText={setTo}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* DATAS */}
            <View style={s.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Data de partida</Text>
                <TouchableOpacity
                  onPress={() => openCalendar('departure')}
                  style={s.dateBox}
                >
                  <Text style={s.dateBoxText}>
                    {dateDeparture ?? 'Selecionar data'}
                  </Text>
                </TouchableOpacity>
              </View>

              {tripType === 'roundtrip' && (
                <>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Data de retorno</Text>
                    <TouchableOpacity
                      onPress={() => openCalendar('return')}
                      style={s.dateBox}
                    >
                      <Text style={s.dateBoxText}>
                        {dateReturn ?? 'Selecionar data'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* CALENDÁRIO SIMPLES COM SETAS DE MÊS */}
            {openCalendarFor && (
              <View style={s.calendarContainer}>
                <View style={s.calendarHeader}>
                  <TouchableOpacity onPress={goPrevMonth}>
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={s.calendarTitle}>
                    {MONTH_NAMES[calMonth]} {calYear}
                  </Text>
                  <TouchableOpacity onPress={goNextMonth}>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.calendarGrid}>
                  {daysOfMonth.map((d) => {
                    const dd = String(d).padStart(2, '0');
                    const mm = String(calMonth + 1).padStart(2, '0');
                    const yyyy = String(calYear);

                    const depSelected =
                      openCalendarFor === 'departure' &&
                      dateDeparture === `${dd}/${mm}/${yyyy}`;
                    const retSelected =
                      openCalendarFor === 'return' &&
                      dateReturn === `${dd}/${mm}/${yyyy}`;
                    const selected = depSelected || retSelected;

                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          s.calendarDay,
                          selected && s.calendarDaySelected,
                        ]}
                        onPress={() => handleSelectDay(d)}
                      >
                        <Text
                          style={[
                            s.calendarDayText,
                            selected && s.calendarDayTextSelected,
                          ]}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PASSAGEIROS */}
            <View style={{ marginTop: 16 }}>
              <Text style={s.label}>Passageiros</Text>

              <View style={s.passengersRow}>
                <View style={s.passengerItem}>
                  <Text style={s.passengerLabel}>ADT</Text>
                  <View style={s.passengerControls}>
                    <TouchableOpacity
                      style={s.passengerBtn}
                      onPress={() => changePassengers('adt', 'dec')}
                    >
                      <Text style={s.passengerBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={s.passengerCount}>
                      {String(adt).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={s.passengerBtn}
                      onPress={() => changePassengers('adt', 'inc')}
                    >
                      <Text style={s.passengerBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.passengerItem}>
                  <Text style={s.passengerLabel}>CHD</Text>
                  <View style={s.passengerControls}>
                    <TouchableOpacity
                      style={s.passengerBtn}
                      onPress={() => changePassengers('chd', 'dec')}
                    >
                      <Text style={s.passengerBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={s.passengerCount}>
                      {String(chd).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={s.passengerBtn}
                      onPress={() => changePassengers('chd', 'inc')}
                    >
                      <Text style={s.passengerBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* SIMULAR VALOR */}
            <View style={{ marginTop: 16 }}>
              <Button title="Confirmar e simular valor" onPress={simulatePrice} />
            </View>

            {/* VALOR + PAGAMENTOS */}
            {totalValue !== null && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.totalValue}>
                  Valor total: R$ {totalValue.toFixed(2)}
                </Text>

                <Text style={[s.label, { marginTop: 12 }]}>Formas de pagamento</Text>

                {/* TIPOS: CRÉDITO / DÉBITO / PIX */}
                <View style={s.paymentTypeRow}>
                  {['Crédito', 'Débito', 'PIX'].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        s.paymentChip,
                        paymentType === tipo && s.paymentChipActive,
                      ]}
                      onPress={() => {
                        setPaymentType(tipo as any);
                        // limpa infos específicas ao trocar tipo
                        setCardNumber('');
                        setInstallments('');
                      }}
                    >
                      <Text
                        style={[
                          s.paymentChipText,
                          paymentType === tipo && s.paymentChipTextActive,
                        ]}
                      >
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* DETALHES DE CARTÃO / PIX */}
                {paymentType === 'Crédito' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={s.labelMini}>Bandeira (Crédito)</Text>
                    <View style={s.paymentTypeRow}>
                      {['Mastercard', 'Visa', 'American Express'].map((b) => (
                        <TouchableOpacity
                          key={b}
                          style={[
                            s.paymentChipSmall,
                            creditBrand === b && s.paymentChipActive,
                          ]}
                          onPress={() => setCreditBrand(b)}
                        >
                          <Text
                            style={[
                              s.paymentChipText,
                              creditBrand === b && s.paymentChipTextActive,
                            ]}
                          >
                            {b}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Input
                      label="4 últimos dígitos do cartão"
                      placeholder="Ex.: 1234"
                      value={cardNumber}
                      onChangeText={(t) => setCardNumber(sanitizeDigits(t))}
                      keyboardType="numeric"
                    />
                    <Input
                      label="Número de parcelas (1 a 15)"
                      placeholder="Ex.: 10"
                      value={installments}
                      onChangeText={(t) => setInstallments(sanitizeDigits(t))}
                      keyboardType="numeric"
                    />
                    <Text style={s.helperText}>
                      Até 10x sem juros. De 11x a 15x com juros (simulação).
                    </Text>
                  </View>
                )}

                {paymentType === 'Débito' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={s.labelMini}>Bandeira (Débito)</Text>
                    <View style={s.paymentTypeRow}>
                      {['Redeshop', 'Visa', 'Elo', 'Hipercard'].map((b) => (
                        <TouchableOpacity
                          key={b}
                          style={[
                            s.paymentChipSmall,
                            debitBrand === b && s.paymentChipActive,
                          ]}
                          onPress={() => setDebitBrand(b)}
                        >
                          <Text
                            style={[
                              s.paymentChipText,
                              debitBrand === b && s.paymentChipTextActive,
                            ]}
                          >
                            {b}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Input
                      label="4 últimos dígitos do cartão"
                      placeholder="Ex.: 5678"
                      value={cardNumber}
                      onChangeText={(t) => setCardNumber(sanitizeDigits(t))}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {paymentType === 'PIX' && (
                  <View style={{ marginTop: 8, alignItems: 'center' }}>
                    <View style={s.qrPix}>
                      <Text style={s.qrPixText}>PIX</Text>
                    </View>
                    <Text style={s.cnpjText}>CNPJ: 75.530.906/0001-17</Text>
                  </View>
                )}

                <View style={{ marginTop: 8 }}>
                  <Input
                    label="Valor (R$)"
                    placeholder="Ex.: 1000,00"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    keyboardType="numeric"
                  />
                  <Button title="Adicionar pagamento" onPress={addPayment} />
                </View>

                {/* LISTA DE PAGAMENTOS */}
                {payments.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {payments.map((p) => (
                      <View key={p.id} style={s.paymentRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.paymentRowText}>
                            {p.tipo} - R$ {p.valor.toFixed(2)}
                          </Text>
                          {p.bandeira && (
                            <Text style={s.paymentRowSub}>
                              {p.bandeira}
                              {p.cardLast4 && ` • **** ${p.cardLast4}`}
                              {p.parcelas && ` • ${p.parcelas}x`}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity onPress={() => removePayment(p.id)}>
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color="#f87171"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <Text
                  style={[
                    s.remainingText,
                    { color: remaining > 0 ? '#ef4444' : '#22c55e' },
                  ]}
                >
                  Restante a pagar: R$ {remaining.toFixed(2)}
                </Text>

                <View style={{ marginTop: 12 }}>
                  <Button
                    title="Finalizar compra"
                    onPress={finalizePurchase}
                  />
                </View>
              </View>
            )}

            {/* LOCALIZADOR + QR FAKE */}
            {locator && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <View style={s.qrFake}>
                  <Text style={s.qrFakeText}>QR CODE</Text>
                </View>
                <Text style={s.locatorText}>Localizador: {locator}</Text>
              </View>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: { color: colors.text, fontWeight: '700' },

  // Comprar
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  sectionHeader: { marginTop: 12, marginBottom: 4 },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },

  tripTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  tripTypeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tripTypeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tripTypeChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  tripTypeChipTextActive: { color: '#fff' },

  rowTwoCols: {
    flexDirection: 'row',
    marginTop: 8,
  },

  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelMini: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },

  dateBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0B1220',
  },
  dateBoxText: {
    color: colors.text,
  },

  calendarContainer: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    backgroundColor: '#020617',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  calendarTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarDaySelected: {
    backgroundColor: '#4b5563',
  },
  calendarDayText: {
    color: colors.text,
    fontSize: 12,
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  passengersRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  passengerItem: { flex: 1 },
  passengerLabel: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passengerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: colors.border,
  },
  passengerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  passengerCount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },

  totalValue: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 16,
  },

  paymentTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  paymentChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  paymentChipSmall: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  paymentChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentChipText: {
    color: colors.text,
    fontSize: 12,
  },
  paymentChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  helperText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },

  paymentRow: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentRowText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  paymentRowSub: {
    color: colors.muted,
    fontSize: 11,
  },

  remainingText: {
    marginTop: 4,
    fontWeight: '700',
  },

  qrFake: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  qrFakeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  locatorText: {
    marginTop: 8,
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },

  qrPix: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#022c22',
  },
  qrPixText: {
    color: '#bbf7d0',
    fontWeight: '700',
    fontSize: 16,
  },
  cnpjText: {
    marginTop: 6,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
