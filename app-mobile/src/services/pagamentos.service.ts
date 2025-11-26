import { userSet, userOnValue } from './firebaseRtdb.helper';
import { createBus } from './eventBus';

export type Pagamento = {
  id: string;
  vooCodigo?: string;
  processoNumero?: string;
  valor: number;
  moeda: 'BRL';
  forma: 'CREDITO' | 'DEBITO' | 'PIX';
  bandeira?: string;      // Visa, Mastercard etc.
  parcelas?: number;
  criadoEm: Date;
};

const pagamentosStore: Pagamento[] = [];
const bus = createBus<Pagamento[]>();

function notify() {
  bus.emit([...pagamentosStore]);
}

function serializePagamentos(list: Pagamento[]) {
  return list.map(p => ({
    ...p,
    criadoEm: p.criadoEm.toISOString(),
  }));
}

function deserializePagamentos(raw: any): Pagamento[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      criadoEm: new Date(p.criadoEm),
    }))
    .filter((p: Pagamento) => !isNaN(p.criadoEm.getTime()));
}

async function syncPagamentosToRtdb() {
  try {
    await userSet('pagamentos', serializePagamentos(pagamentosStore));
  } catch (e) {
    console.log('Erro ao sincronizar pagamentos:', e);
  }
}

export function initPagamentosFromRtdb() {
  userOnValue('pagamentos', (snap) => {
    const val = snap.val();
    const list = deserializePagamentos(val);
    pagamentosStore.length = 0;
    pagamentosStore.push(...list);
    notify();
  });
}

export function onPagamentosChange(fn: (all: Pagamento[]) => void) {
  return bus.subscribe(fn);
}

export function listPagamentos() {
  return [...pagamentosStore];
}

export function addPagamento(p: Pagamento) {
  pagamentosStore.push(p);
  notify();
  syncPagamentosToRtdb();
}

export function removePagamento(id: string) {
  const before = pagamentosStore.length;
  for (let i = pagamentosStore.length - 1; i >= 0; i--) {
    if (pagamentosStore[i].id === id) pagamentosStore.splice(i, 1);
  }
  if (pagamentosStore.length !== before) {
    notify();
    syncPagamentosToRtdb();
  }
}