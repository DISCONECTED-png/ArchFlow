import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMe, loginUser, registerUser } from '../services/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('archflow_token');
    if (!token) { setLoading(false); return; }

    // 3s timeout so a dead/slow backend never blocks the UI forever
    const timeout = setTimeout(() => setLoading(false), 3000);

    fetchMe()
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('archflow_token'))
      .finally(() => { clearTimeout(timeout); setLoading(false); });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('archflow_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    localStorage.setItem('archflow_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('archflow_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
