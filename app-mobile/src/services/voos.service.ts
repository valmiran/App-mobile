// src/services/voos.service.ts
import { createBus } from './eventBus';


export type Voo = {
  codigo: string;      // ex.: AD4518
  origem?: string;     // ex.: REC
  destino?: string;    // ex.: VCP
  eta: Date;           // horário de chegada/partida relevante
};

const voosStore: Voo[] = [];

const voosBus = createBus<Voo[]>();
function notify() {
  voosBus.emit([...voosStore]);
}

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
  if (voosStore.length !== before) notify();
}
