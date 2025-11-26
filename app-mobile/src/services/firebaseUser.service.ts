import {
  updateProfile,
  updateEmail,
  updatePassword,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase-config';

/**
 * Retorna o usuário Firebase atual (ou null se ninguém estiver logado)
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Dados básicos já “prontos” pra usar em telas
 */
export function getCurrentUserInfo() {
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,               // ID único
    email: user.email ?? '',     // e-mail
    displayName: user.displayName ?? '', // nome (se tiver)
    photoURL: user.photoURL ?? '',       // foto (se tiver)
  };
}

/**
 * Atualiza nome e/ou foto do usuário logado
 */
export async function updateUserProfile(options: {
  displayName?: string;
  photoURL?: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário logado.');

  await updateProfile(user, {
    displayName: options.displayName ?? user.displayName ?? null,
    photoURL: options.photoURL ?? user.photoURL ?? null,
  });
}

/**
 * Atualiza o e-mail do usuário logado
 */
export async function updateUserEmail(newEmail: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário logado.');

  await updateEmail(user, newEmail);
}

/**
 * Atualiza a senha do usuário logado
 */
export async function updateUserPassword(newPassword: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nenhum usuário logado.');

  await updatePassword(user, newPassword);
}