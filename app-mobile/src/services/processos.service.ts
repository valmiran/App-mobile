// src/services/processos.service.ts
import { createBus } from './eventBus';

export type ProcessoStatus = 'aberto' | 'observação' | 'finalizado' | 'vencido';
export type Processo = {
  processNumber: string;
  tipo: 'AHL' | 'DPR' | 'OHD';
  cliente?: string;
  pnr?: string;
  bag?: string;
  dano?: string;
  solucao?: 'Conserto' | 'Mala nova' | 'Voucher' | 'Não há tratativas';
  status: ProcessoStatus;
  criadoEm: Date;
  finalizadoEm?: Date;
};

// armazenamento simples em memória
const store: Processo[] = [];

// === BUS para mudanças ===
const processosBus = createBus<Processo[]>();
function notify() {
  processosBus.emit([...store]);
}

// permitir que outros módulos “escutem”
export function onProcessosChange(fn: (all: Processo[]) => void) {
  return processosBus.subscribe(fn);
}

export function listProcessos() {
  return [...store];
}

export function addProcess(p: Processo) {
  if (store.some(x => x.processNumber === p.processNumber)) {
    throw new Error(`Processo ${p.processNumber} já existe`);
  }
  store.unshift(p);
  notify();
}

export function finalizeProcess(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'finalizado', finalizadoEm: new Date() };
    notify();
  }
}

export function setObservation(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'observação' };
    notify();
  }
}

export function setOpen(processNumber: string) {
  const i = store.findIndex(p => p.processNumber === processNumber);
  if (i >= 0) {
    store[i] = { ...store[i], status: 'aberto' };
    notify();
  }
}
