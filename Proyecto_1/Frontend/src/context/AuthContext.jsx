import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setToken, setUnauthorizedHandler } from '../api/client';
import { clearSession, readSession, saveSession } from '../api/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  setToken(session?.token || null);

  const login = useCallback((newSession) => {
    saveSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const updateUser = useCallback((user) => {
    setSession((current) => {
      const updated = { ...current, user };
      saveSession(updated);
      return updated;
    });
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const value = useMemo(
    () => ({ user: session?.user || null, token: session?.token || null, login, logout, updateUser }),
    [session, login, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
