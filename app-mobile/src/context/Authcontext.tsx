import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type User = { id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 300));

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    const ADMIN_EMAIL = 'valmiran@gmail.com';
    const ADMIN_PASS = '9347hpvoo!';

    if (inputEmail === ADMIN_EMAIL && inputPass === ADMIN_PASS) {
      setUser({ id: '1', name: 'Valmiran', email: ADMIN_EMAIL });
      return;
    }
    throw new Error('Credenciais inválidas');
  };

  const signOut = () => setUser(null);

  const value = useMemo<AuthContextType>(
    () => ({ user, signIn, signOut }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
};
