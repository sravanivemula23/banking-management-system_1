import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';
import { getTokenExpiry, tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

/** Restore a session from storage only if the token exists and has not expired. */
function loadSession() {
  const token = tokenStorage.get();
  const user = tokenStorage.getUser();
  if (!token || !user) return null;
  const exp = getTokenExpiry(token);
  if (exp && exp <= Date.now()) {
    tokenStorage.clear();
    return null;
  }
  return { token, user };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setSession(null); // ProtectedRoute then redirects to /login
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    tokenStorage.save(data.token, data.user);
    setSession({ token: data.token, user: data.user });
    return data.user;
  }, []);

  // Any 401 from a protected API call ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (tokenStorage.get()) toast.error('Your session has expired. Please sign in again.', { toastId: 'expired' });
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Log out automatically when the JWT expires, without waiting for a failing request.
  useEffect(() => {
    if (!session) return undefined;
    const exp = getTokenExpiry(session.token);
    if (!exp) return undefined;
    const delay = Math.max(exp - Date.now(), 0);
    const id = setTimeout(() => {
      toast.info('Your session has expired. Please sign in again.', { toastId: 'expired' });
      logout();
    }, Math.min(delay, 2 ** 31 - 1));
    return () => clearTimeout(id);
  }, [session, logout]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isAdmin: session?.user?.role === 'ADMIN',
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
