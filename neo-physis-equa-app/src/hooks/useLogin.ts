import { useState } from 'react';
import { type LoginData } from '../services/auth';
import { useSession } from './useSession';

interface UseLoginResult {
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<boolean>;
}

export function useLogin(): UseLoginResult {
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await signIn(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado del servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login };
}
