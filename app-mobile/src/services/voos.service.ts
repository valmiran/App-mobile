// src/services/voos.service.ts
export type Voo = { id: string; code: string; origemOuDest: string; hora: string }; // HH:MM

let voos: Voo[] = [];
const listeners = new Set<() => void>();

export function addFlight(v: Voo) {
  voos = [v, ...voos];
  notify();
}

export function getNextFlightLabel(): string | null {
  // retorna "AD2814 — 10:30" do voo mais próximo >= agora (considerando apenas hora de hoje)
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const todayMins = (hhmm: string) => {
    const [H, M] = hhmm.split(':').map(Number);
    return H * 60 + M;
  };

  const future = voos
    .map(v => ({ v, mins: todayMins(v.hora) }))
    .filter(x => x.mins >= nowMins)
    .sort((a, b) => a.mins - b.mins);

  const chosen = future[0]?.v ?? voos.sort((a, b) => a.hora.localeCompare(b.hora))[0]; // fallback: mais cedo
  return chosen ? `${chosen.code} — ${chosen.hora}` : null;
}

export function subscribeNextFlight(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach(cb => cb());
}
