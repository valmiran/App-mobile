import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../Theme/colors';
import Card from '../Components/Card';

type Pessoa = { nome: string; funcao: string };

// CHEGADAS (MCZ)
type Chegada = {
  voo: string;
  origem: string;
  hotran: string;
  eta: string;
  clts: string;
  ssr: string;
  prefixo: string;
  box: string;
};

// PARTIDAS (de MCZ)
type Partida = {
  voo: string;
  dest: string;
  hotram: string;
  trip: string;
  gate: string;
  pista: string;
  ssr: string;
  clts: string;
  liderDnata?: string;
  anfriao?: string;
};

export default function MalhaScreen() {
  const THEME = {
    bg: colors.bg,
    text: colors.text,
    border: colors.border,
    card: (colors as any).card ?? '#0B1220',
    primary: (colors as any).primary ?? '#2563eb',
    danger: (colors as any).danger ?? '#ef4444',
  };

  // controle de existência de malha ativa
  const [malhaAtiva, setMalhaAtiva] = useState(false);
  // etapas
  const [step, setStep] = useState<'intro'|'equipe'|'voos'|'revisar'>('intro');

  // ----------------------- EQUIPE / OBRIGATÓRIOS ----------------
  const [coi, setCoi] = useState('');
  const [desembarque, setDesembarque] = useState('');
  const [embarques, setEmbarques] = useState('');
  const [pistas, setPistas] = useState('');
  const [encerramento, setEncerramento] = useState('');

  // opcionais
  const [lideresDnata, setLideresDnata] = useState('');
  const [anfritao, setAnfritao] = useState('');

  // incremental (com remoção)
  const [extras, setExtras] = useState<Pessoa[]>([]);
  const [extraNome, setExtraNome] = useState('');
  const [extraFuncao, setExtraFuncao] = useState('');

  function addExtra() {
    if (!extraNome.trim() || !extraFuncao.trim()) {
      return Alert.alert('Atenção', 'Informe nome e função para adicionar.');
    }
    setExtras(prev => [...prev, { nome: extraNome.trim(), funcao: extraFuncao.trim() }]);
    setExtraNome('');
    setExtraFuncao('');
  }
  function removeExtra(index: number) {
    setExtras(prev => prev.filter((_, i) => i !== index));
  }

  function validarEquipe(): boolean {
    const faltas: string[] = [];
    if (!coi.trim()) faltas.push('COI (Comandante da Operação em Solo)');
    if (!desembarque.trim()) faltas.push('Desembarque');
    if (!embarques.trim()) faltas.push('Embarques');
    if (!pistas.trim()) faltas.push('Pistas');
    if (!encerramento.trim()) faltas.push('Encerramento');

    if (faltas.length) {
      Alert.alert(
        'Atribuição necessária',
        `Para realizar a Operação, esta função precisa ser atribuída a alguém:\n\n- ${faltas.join('\n- ')}`
      );
      return false;
    }
    return true;
  }

  // -------------------------- VOOS --------------------------
  const [chegadas, setChegadas] = useState<Chegada[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);

  // forms de chegada
  const [cVoo, setCVoo] = useState('');
  const [cOrig, setCOrig] = useState('');
  const [cHotran, setCHotran] = useState('');
  const [cEta, setCEta] = useState('');
  const [cClts, setCClts] = useState('');
  const [cSsr, setCSsr] = useState('');
  const [cPrefixo, setCPrefixo] = useState('');
  const [cBox, setCBox] = useState('');

  function addChegada() {
    if (!cVoo.trim() || !cOrig.trim() || !cHotran.trim() || !cEta.trim()) {
      return Alert.alert('Dados insuficientes', 'Preencha pelo menos Nº do voo, Origem, HOTRAN e ETA.');
    }
    const novo: Chegada = {
      voo: cVoo.trim().toUpperCase(),
      origem: cOrig.trim().toUpperCase(),
      hotran: cHotran.trim(),
      eta: cEta.trim(),
      clts: cClts.trim(),
      ssr: cSsr.trim(),
      prefixo: cPrefixo.trim().toUpperCase(),
      box: cBox.trim(),
    };
    setChegadas(prev => [...prev, novo]);
    setCVoo(''); setCOrig(''); setCHotran(''); setCEta(''); setCClts(''); setCSsr(''); setCPrefixo(''); setCBox('');
  }

  // forms de partida
  const [pVoo, setPVoo] = useState('');
  const [pDest, setPDest] = useState('');
  const [pHotram, setPHotram] = useState('');
  const [pTrip, setPTrip] = useState('');
  const [pGate, setPGate] = useState('');
  const [pPista, setPPista] = useState('');
  const [pSsr, setPSsr] = useState('');
  const [pClts, setPClts] = useState('');

  function addPartida() {
    if (!pVoo.trim() || !pDest.trim() || !pHotram.trim()) {
      return Alert.alert('Dados insuficientes', 'Preencha pelo menos Nº do voo, DEST e HOTRAM.');
    }
    const novo: Partida = {
      voo: pVoo.trim().toUpperCase(),
      dest: pDest.trim().toUpperCase(),
      hotram: pHotram.trim(),
      trip: pTrip.trim().toUpperCase(),
      gate: pGate.trim().toUpperCase(),
      pista: pPista.trim(),
      ssr: pSsr.trim(),
      clts: pClts.trim(),
      liderDnata: lideresDnata.trim() || undefined,
      anfriao: anfritao.trim() || undefined,
    };
    setPartidas(prev => [...prev, novo]);
    setPVoo(''); setPDest(''); setPHotram(''); setPTrip(''); setPGate(''); setPPista(''); setPSsr(''); setPClts('');
  }

  // exclusão/reset total da malha
  function excluirMalha() {
    Alert.alert('Excluir malha', 'Tem certeza que deseja excluir a malha atual?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          // reset total
          setCoi(''); setDesembarque(''); setEmbarques(''); setPistas(''); setEncerramento('');
          setLideresDnata(''); setAnfritao('');
          setExtras([]);
          setChegadas([]); setPartidas([]);
          setCVoo(''); setCOrig(''); setCHotran(''); setCEta(''); setCClts(''); setCSsr(''); setCPrefixo(''); setCBox('');
          setPVoo(''); setPDest(''); setPHotram(''); setPTrip(''); setPGate(''); setPPista(''); setPSsr(''); setPClts('');
          setMalhaAtiva(false);
          setStep('intro');
        },
      },
    ]);
  }

  // ------------------------- PDF (expo-print) -------------------------
  const html = useMemo(() => {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        h1 { margin: 0 0 12px 0; font-size: 20px; }
        h2 { margin: 18px 0 8px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
        th { background: #f1f5f9; text-align: left; }
        .muted { color: #64748b; font-size: 12px; }
        .caps { text-transform: uppercase; }
      </style>
    `;

    const equipeRows = [
      ['COI', coi],
      ['Desembarque', desembarque],
      ['Embarques', embarques],
      ['Pistas', pistas],
      ['Encerramento', encerramento],
      ['Líderes DNATA (opcional)', lideresDnata],
      ['Anfitrião (opcional)', anfritao],
    ].map(([k,v]) => `<tr><th>${k}</th><td class="caps">${(v||'—')}</td></tr>`).join('');

    const extrasRows = extras.length
      ? extras.map(e => `<tr><td class="caps">${e.funcao}</td><td class="caps">${e.nome}</td></tr>`).join('')
      : `<tr><td colspan="2" class="muted">Sem cadastros adicionais.</td></tr>`;

    const chegTh = `
      <tr>
        <th>VOO</th><th>ORIG</th><th>HOTRAN</th><th>ETA</th><th>CLTS</th><th>SSR</th><th>PREFIXO</th><th>BOX</th>
      </tr>`;
    const chegRows = (chegadas.length
      ? chegadas.map(c => `<tr>
          <td class="caps">${c.voo}</td>
          <td class="caps">${c.origem}</td>
          <td>${c.hotran}</td>
          <td>${c.eta}</td>
          <td>${c.clts || '—'}</td>
          <td>${c.ssr || '—'}</td>
          <td class="caps">${c.prefixo || '—'}</td>
          <td>${c.box || '—'}</td>
        </tr>`).join('')
      : `<tr><td colspan="8" class="muted">Sem chegadas cadastradas.</td></tr>`);

    const partTh = `
      <tr>
        <th>VOO</th><th>DEST</th><th>HOTRAM</th><th>TRIP</th><th>GATE</th><th>PISTA</th><th>SSR</th><th>CLTS</th><th>LÍDER DNATA</th><th>ANFITRIÃO</th>
      </tr>`;
    const partRows = (partidas.length
      ? partidas.map(p => `<tr>
          <td class="caps">${p.voo}</td>
          <td class="caps">${p.dest}</td>
          <td>${p.hotram}</td>
          <td class="caps">${p.trip || '—'}</td>
          <td class="caps">${p.gate || '—'}</td>
          <td>${p.pista || '—'}</td>
          <td>${p.ssr || '—'}</td>
          <td>${p.clts || '—'}</td>
          <td class="caps">${p.liderDnata || '—'}</td>
          <td class="caps">${p.anfriao || '—'}</td>
        </tr>`).join('')
      : `<tr><td colspan="10" class="muted">Sem partidas cadastradas.</td></tr>`);

    return `
      <!doctype html>
      <html>
        <head>${styles}</head>
        <body>
          <h1>Malha da Operação</h1>

          <h2>Malha de Atendimento</h2>
          <table>${equipeRows}</table>

          <h2>Cadastro incremental</h2>
          <table>
            <tr><th>Função</th><th>Nome</th></tr>
            ${extrasRows}
          </table>

          <h2>Chegadas (MCZ)</h2>
          <table>${chegTh}${chegRows}</table>

          <h2>Partidas (de MCZ)</h2>
          <table>${partTh}${partRows}</table>

          <p class="muted">Gerado via aplicativo.</p>
        </body>
      </html>
    `;
  }, [coi, desembarque, embarques, pistas, encerramento, lideresDnata, anfritao, extras, chegadas, partidas]);

  async function gerarPDF() {
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível gerar/compartilhar o PDF.');
    }
  }

  // ------------------------- UI -------------------------
  return (
    <View style={[s.wrap, { backgroundColor: THEME.bg }]}>
      <Text style={[s.title, { color: THEME.text }]}>Malha da Operação</Text>

      {/* Scroll lateral ativado */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator
      >
        {step === 'intro' && (
          <Card>
            <Text style={[s.subtitle, { color: THEME.text }]}>
              Preencha a equipe e os voos para gerar a Malha da Operação.
            </Text>

            {!malhaAtiva ? (
              <TouchableOpacity
                style={[s.btn, { backgroundColor: THEME.primary }]}
                onPress={() => {
                  setMalhaAtiva(true);
                  setStep('equipe');
                }}
              >
                <Text style={s.btnText}>Criar malha</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={{ color: THEME.text }}>
                  Já existe uma malha ativa. Exclua-a para criar outra.
                </Text>
                <TouchableOpacity
                  style={[s.btn, { backgroundColor: THEME.danger }]}
                  onPress={excluirMalha}
                >
                  <Text style={s.btnText}>Excluir malha atual</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {step === 'equipe' && (
          <Card>
            <Text style={[s.section, { color: THEME.text }]}>Malha de Atendimento</Text>
            <Text style={{ color: THEME.text, marginBottom: 10 }}>
              Objetivo: visão estratégica de quem está em qual posição por turno (manhã/tarde/noite/madrugada).
            </Text>

            {/* Obrigatórios */}
            <Field label="COI (Comandante da Operação em Solo)" value={coi} onChangeText={setCoi} />
            <Field label="Desembarque (nome(s), separado por vírgula)" value={desembarque} onChangeText={setDesembarque} />
            <Field label="Embarques (nome(s), separado por vírgula)" value={embarques} onChangeText={setEmbarques} />
            <Field label="Pistas (nome(s), separado por vírgula)" value={pistas} onChangeText={setPistas} />
            <Field label="Encerramento (nome)" value={encerramento} onChangeText={setEncerramento} />

            {/* Opcionais */}
            <Field label="Líderes DNATA (opcional, nomes por vírgula)" value={lideresDnata} onChangeText={setLideresDnata} />
            <Field label="Anfitrião (opcional)" value={anfritao} onChangeText={setAnfritao} />

            {/* Cadastro incremental + remoção */}
            <Text style={[s.section, { color: THEME.text, marginTop: 8 }]}>Cadastro incremental</Text>
            <View style={{ gap: 8 }}>
              <Field label="Nome" value={extraNome} onChangeText={setExtraNome} />
              <Field label="Função" value={extraFuncao} onChangeText={setExtraFuncao} />
              <TouchableOpacity style={[s.btnGhost, { borderColor: THEME.primary }]} onPress={addExtra}>
                <Text style={[s.btnGhostText, { color: THEME.primary }]}>Adicionar pessoa</Text>
              </TouchableOpacity>
            </View>

            {extras.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: THEME.text, fontWeight: '700', marginBottom: 6 }}>
                  Pessoas adicionadas:
                </Text>
                <FlatList
                  data={extras}
                  keyExtractor={(_, idx) => String(idx)}
                  renderItem={({ item, index }) => (
                    <View style={s.personRow}>
                      <Text style={{ color: THEME.text, flex: 1 }}>
                        • {item.funcao} — {item.nome}
                      </Text>
                      <TouchableOpacity onPress={() => removeExtra(index)}>
                        <Text style={{ color: THEME.danger, fontWeight: '700' }}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Ações */}
            <View style={{ gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: THEME.primary }]}
                onPress={() => {
                  if (!validarEquipe()) return;
                  setStep('voos');
                }}
              >
                <Text style={s.btnText}>Continuar para voos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.btn, { backgroundColor: THEME.danger }]}
                onPress={excluirMalha}
              >
                <Text style={s.btnText}>Excluir malha</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {step === 'voos' && (
          <Card>
            <Text style={[s.section, { color: THEME.text }]}>Cadastro de voos (para a malha)</Text>

            {/* Chegadas */}
            <Text style={[s.groupTitle, { color: THEME.text }]}>Chegadas (MCZ)</Text>
            <Field label="Nº do voo" value={cVoo} onChangeText={setCVoo} autoCapitalize="characters" />
            <Field label="Origem (ex.: REC)" value={cOrig} onChangeText={setCOrig} autoCapitalize="characters" />
            <Field label="HOTRAN (oficial)" value={cHotran} onChangeText={setCHotran} />
            <Field label="ETA" value={cEta} onChangeText={setCEta} />
            <Field label="CLTS (desembarque)" value={cClts} onChangeText={setCClts} />
            <Field label="SSR (ex.: 02 INF, 02 WCHR)" value={cSsr} onChangeText={setCSsr} />
            <Field label="Prefixo (aeronave)" value={cPrefixo} onChangeText={setCPrefixo} autoCapitalize="characters" />
            <Field label="BOX (posição)" value={cBox} onChangeText={setCBox} />
            <TouchableOpacity style={[s.btnGhost, { borderColor: THEME.primary }]} onPress={addChegada}>
              <Text style={[s.btnGhostText, { color: THEME.primary }]}>Adicionar chegada</Text>
            </TouchableOpacity>

            {/* Partidas */}
            <Text style={[s.groupTitle, { color: THEME.text, marginTop: 16 }]}>Partidas (de MCZ)</Text>
            <Field label="Nº do voo" value={pVoo} onChangeText={setPVoo} autoCapitalize="characters" />
            <Field label="DEST (ex.: VCP)" value={pDest} onChangeText={setPDest} autoCapitalize="characters" />
            <Field label="HOTRAM (decolagem)" value={pHotram} onChangeText={setPHotram} />
            <Field label="TRIP (LOCAL/TST)" value={pTrip} onChangeText={setPTrip} autoCapitalize="characters" />
            <Field label="GATE" value={pGate} onChangeText={setPGate} />
            <Field label="PISTA (responsáveis)" value={pPista} onChangeText={setPPista} />
            <Field label="SSR (embarque)" value={pSsr} onChangeText={setPSsr} />
            <Field label="CLTS (embarque)" value={pClts} onChangeText={setPClts} />
            <TouchableOpacity style={[s.btnGhost, { borderColor: THEME.primary }]} onPress={addPartida}>
              <Text style={[s.btnGhostText, { color: THEME.primary }]}>Adicionar partida</Text>
            </TouchableOpacity>

            <View style={{ gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: THEME.primary }]}
                onPress={() => setStep('revisar')}
              >
                <Text style={s.btnText}>Revisar e gerar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.btn, { backgroundColor: THEME.danger }]}
                onPress={excluirMalha}
              >
                <Text style={s.btnText}>Excluir malha</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {step === 'revisar' && (
          <Card>
            <Text style={[s.section, { color: THEME.text }]}>Saída (Relatório)</Text>
            <Text style={{ color: THEME.text, marginBottom: 6 }}>
              Será gerado um PDF com a tabela de posições e voos. Você poderá salvar/compartilhar no telefone.
            </Text>

            <TouchableOpacity style={[s.btn, { backgroundColor: THEME.primary }]} onPress={gerarPDF}>
              <Text style={s.btnText}>Gerar PDF</Text>
            </TouchableOpacity>

            <View style={{ gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[s.btnGhost, { borderColor: THEME.primary }]} onPress={() => setStep('voos')}>
                <Text style={[s.btnGhostText, { color: THEME.primary }]}>Voltar e editar voos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnGhost, { borderColor: THEME.primary }]} onPress={() => setStep('equipe')}>
                <Text style={[s.btnGhostText, { color: THEME.primary }]}>Voltar e editar equipe</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.btn, { backgroundColor: THEME.danger }]} onPress={excluirMalha}>
                <Text style={s.btnText}>Excluir malha</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

// ------------------------ Subcomponente de input ------------------------
function Field({
  label,
  value,
  onChangeText,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: colors.text, marginBottom: 6, fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 10,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  subtitle: { fontWeight: '700', marginBottom: 6 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  groupTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  btn: {
    padding: 12, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhost: {
    padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, backgroundColor: 'transparent',
  },
  btnGhostText: { fontWeight: '700' },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
});
