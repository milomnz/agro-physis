import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { type RegisterData } from '../services/auth';
import { type RegisterForm } from '../utils/auth-validators';
import { useSession } from './useSession';

interface UseRegisterResult {
  control: Control<RegisterForm>;
  disability: string;
  setDisability: (value: string) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  submit: (onSuccess: () => void) => () => Promise<void>;
  dismissError: () => void;
}

export function useRegister(): UseRegisterResult {
  const { signUp } = useSession();
  const [disability, setDisability] = useState('ninguna');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
    },
  });

  const submit = (onSuccess: () => void) =>
    handleSubmit(async (data) => {
      setError(null);
      try {
        const payload: RegisterData = {
          name: (data.nombre ?? '').trim(),
          email: (data.email ?? '').trim(),
          password: data.password,
          disabilityType: disability === 'ninguna' ? null : disability,
          accessibilityProfile: { ttsEnabled, highContrast },
        };
        await signUp(payload);
        reset({ nombre: '', email: '', password: '' });
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado del servidor');
      }
    });

  return {
    control,
    disability,
    setDisability,
    ttsEnabled,
    setTtsEnabled,
    highContrast,
    setHighContrast,
    loading: isSubmitting,
    error,
    submit,
    dismissError: () => setError(null),
  };
}
