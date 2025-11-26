import { ref, set, onValue, DataSnapshot } from 'firebase/database';
import { rtdb, auth } from '../config/firebase-config';

/**
 * Retorna o caminho base do usuário logado no RTDB.
 * Se não tiver logado ainda, usa 'public' só pra evitar crash.
 */
export function userBasePath() {
  const uid = auth.currentUser?.uid ?? 'public';
  return `users/${uid}`;
}

/**
 * Helper para setar um valor em um caminho relativo ao usuário.
 * Ex.: userSet('voos', listaDeVoos)
 */
export async function userSet(path: string, value: any) {
  const base = userBasePath();
  const fullPath = `${base}/${path}`;
  await set(ref(rtdb, fullPath), value);
}

/**
 * Helper para escutar alterações em determinado caminho do usuário.
 */
export function userOnValue(
  path: string,
  callback: (snap: DataSnapshot) => void
) {
  const base = userBasePath();
  const fullPath = `${base}/${path}`;
  const r = ref(rtdb, fullPath);
  onValue(r, callback);
}