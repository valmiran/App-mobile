import { createBus } from './eventBus';
import { userSet, userOnValue } from './firebaseRtdb.helper';

// -----------------------------------------------------
// Tipagem (mantive a sua + deixei compatível com Firebase)
// -----------------------------------------------------
export type ProcessoStatus = 'aberto' | 'observação' | 'finalizado' | 'vencido';

export type Processo = {
  processNumber: string;                     // identificador
  tipo: 'AHL' | 'DPR' | 'OHD';               // tipo
  cliente?: string;
  pnr?: string;
  bag?: string;
  dano?: string;
  solucao?: 'Conserto' | 'Mala nova' | 'Voucher' | 'Não há tratativas';
  status: ProcessoStatus;
  criadoEm: Date;
  finalizadoEm?: Date;
  descricao?: string;                        // adição opcional
};

// -----------------------------------------------------
// Armazenamento em memória (cache local)
// -----------------------------------------------------
const store: Processo[] = [];

// -----------------------------------------------------
// BUS para mudança (listeners)
// -----------------------------------------------------
const processosBus = createBus<Processo[]>();
function notify() {
  processosBus.emit([...store]);
}

// Assinatura externa:
export function onProcessosChange(fn: (all: Processo[]) => void) {
  return processosBus.subscribe(fn);
}

export function listProcessos() {
  return [...store];
}

// -----------------------------------------------------
// Serialização para o Firebase (Date -> string)
// -----------------------------------------------------
function serialize(list: Processo[]) {
  return list.map(p => ({
    ...p,
    criadoEm: p.criadoEm.toISOString(),
    finalizadoEm: p.finalizadoEm ? p.finalizadoEm.toISOString() : null,
  }));
}

// -----------------------------------------------------
// Desserializar (string -> Date)
// -----------------------------------------------------
function deserialize(raw: any): Processo[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      criadoEm: new Date(p.criadoEm),
      finalizadoEm: p.finalizadoEm ? new Date(p.finalizadoEm) : undefined,
    }));
}

// -----------------------------------------------------
// Sincronização com Firebase RTDB
// -----------------------------------------------------
async function syncToFirebase() {
  try {
    await userSet('processos', serialize(store));
  } catch (err) {
    console.log('Erro ao sincronizar processos com Firebase:', err);
  }
}

// -----------------------------------------------------
// Inicializa listener do Firebase (para atualizações em tempo real)
// -----------------------------------------------------
export function initProcessosFromRtdb() {
  userOnValue('processos', snap => {
    const val = snap.val();
    const list = deserialize(val);

    store.length = 0;
    store.push(...list);

    notify();
  });
}

// -----------------------------------------------------
// API PÚBLICA (mesmo que você já usava)
// -----------------------------------------------------

export function addProcess(p: Processo) {
  if (store.some(x => x.processNumber === p.processNumber)) {
    throw new Error(`Processo ${p.processNumber} já existe`);
  }

  store.unshift(p);
  notify();
  syncToFirebase();
}

export function finalizeProcess(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = {
      ...store[i],
      status: 'finalizado',
      finalizadoEm: new Date(),
    };
    notify();
    syncToFirebase();
  }
}

export function setObservation(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'observação' };
    notify();
    syncToFirebase();
  }
}

export function setOpen(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'aberto' };
    notify();
    syncToFirebase();
  }
}

export function setVencido(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'vencido' };
    notify();
    syncToFirebase();
  }
}