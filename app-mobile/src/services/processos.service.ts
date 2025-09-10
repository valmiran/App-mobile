// src/services/processos.service.ts
export type Status = 'aberto' | 'observação' | 'finalizado' | 'vencido';

export type Processo = {
  processNumber: string;
  tipo: 'AHL' | 'DPR' | 'OHD';
  cliente?: string;
  pnr?: string;
  bag?: string;
  dano?: string;
  solucao?: 'Conserto' | 'Mala nova' | 'Voucher' | 'Não há tratativas';
  status: Status;
  criadoEm: Date;
  finalizadoEm?: Date;
};

let store: Processo[] = [];
const listeners = new Set<() => void>();

export function addProcess(proc: Processo) {
  const exists = store.some(p => p.processNumber === proc.processNumber);
  if (exists) throw new Error('Processo duplicado');
  store = [proc, ...store];
  notify();
}

export function finalizeProcess(processNumber: string) {
  store = store.map(p =>
    p.processNumber === processNumber
      ? { ...p, status: 'finalizado', finalizadoEm: new Date() }
      : p
  );
  notify();
}

export function setObservation(processNumber: string) {
  store = store.map(p =>
    p.processNumber === processNumber ? { ...p, status: 'observação' } : p
  );
  notify();
}

/** Reabre processo que estava em observação (status -> aberto) */
export function setOpen(processNumber: string) {
  store = store.map(p =>
    p.processNumber === processNumber ? { ...p, status: 'aberto' } : p
  );
  notify();
}

export function getSummary() {
  const abertos = store.filter(p => p.status === 'aberto' || p.status === 'observação').length;
  const vencidos = store.filter(p => p.status === 'vencido').length;
  return { abertos, vencidos };
}

export function subscribeProcessSummary(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach(cb => cb());
}
