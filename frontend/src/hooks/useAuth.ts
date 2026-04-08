import { useState, useCallback } from 'react';
import { useServices } from '../providers/ServiceProvider';
import { IUser } from '../interfaces/models/IUser';

export function useAuth() {
  const { authService } = useServices();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      if (result.success && result.user) {
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
    setUser(null);
  }, [authService]);

  return { user, loading, error, login, logout };
}
