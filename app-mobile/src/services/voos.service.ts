// src/services/voos.service.ts
import { createBus } from './eventBus';
import { userSet, userOnValue } from './firebaseRtdb.helper';

export type Voo = {
  codigo: string;      // ex.: AD4518
  origem?: string;     // ex.: REC
  destino?: string;    // ex.: VCP
  eta: Date;           // horário relevante
};

const voosStore: Voo[] = [];

const voosBus = createBus<Voo[]>();
function notify() {
  voosBus.emit([...voosStore]);
}

/**
 * 🔄 Converte o array em algo gravável no RTDB
 * (Date -> ISO string)
 */
function serializeVoos(list: Voo[]) {
  return list.map((v) => ({
    codigo: v.codigo,
    origem: v.origem ?? null,
    destino: v.destino ?? null,
    eta: v.eta.toISOString(),
  }));
}

/**
 * 🔄 Converte do RTDB (JSON) de volta pra nossa tipagem com Date
 */
function deserializeVoos(raw: any): Voo[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(Boolean)
    .map((v: any) => ({
      codigo: String(v.codigo),
      origem: v.origem ?? undefined,
      destino: v.destino ?? undefined,
      eta: new Date(v.eta),
    }))
    .filter((v: Voo) => !isNaN(v.eta.getTime()));
}

/**
 * 🔁 Sincroniza voosStore -> Firebase RTDB
 * Segue a lógica do slide:
 * set(ref(database, 'nome'), 'Carlos')
 */
async function syncVoosToRtdb() {
  try {
    const plain = serializeVoos(voosStore);
    await userSet('voos', plain);
  } catch (e) {
    console.log('Erro ao sincronizar voos com RTDB:', e);
  }
}

/**
 * Inicializa assinatura no RTDB.
 * Quando o valor muda no Firebase, atualiza voosStore + notifica.
 */
export function initVoosFromRtdb() {
  userOnValue('voos', (snap) => {
    const val = snap.val();
    const list = deserializeVoos(val);
    voosStore.length = 0;
    voosStore.push(...list);
    notify();
  });
}

// -------------------------------------------------------
// API pública (igual você já usava)
// -------------------------------------------------------

export function onVoosChange(fn: (all: Voo[]) => void) {
  return voosBus.subscribe(fn);
}

export function listVoos() {
  return [...voosStore];
}

export function addVoo(v: Voo) {
  // opcional: evitar duplicados por código + eta
  if (voosStore.some(x => x.codigo === v.codigo && x.eta.getTime() === v.eta.getTime())) {
    throw new Error(`Voo ${v.codigo} já cadastrado para esse horário`);
  }
  voosStore.push(v);
  notify();
  // 🔄 salva no Firebase
  syncVoosToRtdb();
}

export function removeVoo(codigo: string, eta?: Date) {
  const before = voosStore.length;
  if (eta) {
    const t = eta.getTime();
    for (let i = voosStore.length - 1; i >= 0; i--) {
      if (voosStore[i].codigo === codigo && voosStore[i].eta.getTime() === t) {
        voosStore.splice(i, 1);
      }
    }
  } else {
    for (let i = voosStore.length - 1; i >= 0; i--) {
      if (voosStore[i].codigo === codigo) voosStore.splice(i, 1);
    }
  }
  if (voosStore.length !== before) {
    notify();
    syncVoosToRtdb();
  }
}
