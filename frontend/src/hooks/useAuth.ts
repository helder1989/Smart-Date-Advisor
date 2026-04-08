import { useState, useCallback, useEffect } from 'react';
import { useServices } from '../providers/ServiceProvider';
import { IUser } from '../interfaces/models/IUser';

const TOKEN_KEY = 'api_v3-token';

export function useAuth() {
  const { authService } = useServices();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authService.getCurrentUser().then((u) => {
        if (u) setUser(u);
        setChecking(false);
      }).catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [authService]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      if (result.success && result.user) {
        if (result.token) {
          localStorage.setItem(TOKEN_KEY, result.token);
        }
        setUser(result.user);
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, [authService]);

  return { user, loading, checking, error, login, logout };
}
