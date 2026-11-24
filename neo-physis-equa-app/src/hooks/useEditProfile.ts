import { useCallback, useEffect, useState } from 'react';
import { validateNombre } from '../utils/auth-validators';
import { useSession } from './useSession';

export interface EditProfileErrors {
  nombre?: string;
}

export interface UseEditProfileResult {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  nombre: string;
  setNombre: (value: string) => void;
  disability: string;
  setDisability: (value: string) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  errors: EditProfileErrors;
  apiError: string | null;
  successMessage: string | null;
  submitting: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  submit: () => Promise<boolean>;
}

export function useEditProfile(): UseEditProfileResult {
  const { session, updateSessionProfile } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(() => session?.nombre ?? '');
  const [disability, setDisability] = useState(() => session?.disabilityType || 'ninguna');
  const [ttsEnabled, setTtsEnabled] = useState(
    () => session?.accessibilityProfile?.ttsEnabled === true,
  );
  const [highContrast, setHighContrast] = useState(
    () => session?.accessibilityProfile?.highContrast === true,
  );
  const [errors, setErrors] = useState<EditProfileErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const syncFromSession = useCallback(() => {
    if (!session) return;
    setNombre(session.nombre ?? '');
    setDisability(session.disabilityType || 'ninguna');
    setTtsEnabled(session.accessibilityProfile?.ttsEnabled === true);
    setHighContrast(session.accessibilityProfile?.highContrast === true);
  }, [session]);

  useEffect(() => {
    if (!isEditing) {
      syncFromSession();
    }
  }, [session, isEditing, syncFromSession]);

  const startEditing = useCallback(() => {
    syncFromSession();
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  }, [syncFromSession]);

  const cancelEditing = useCallback(() => {
    syncFromSession();
    setErrors({});
    setApiError(null);
    setIsEditing(false);
  }, [syncFromSession]);

  const submit = useCallback(async (): Promise<boolean> => {
    const nombreError = validateNombre(nombre);
    if (nombreError) {
      setErrors({ nombre: nombreError });
      return false;
    }

    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      await updateSessionProfile({
        nombre: nombre.trim(),
        disabilityType: disability,
        accessibilityProfile: {
          ttsEnabled,
          highContrast,
        },
      });
      setSuccessMessage('Perfil y preferencias actualizados correctamente');
      setIsEditing(false);
      return true;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error inesperado del servidor');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [nombre, disability, ttsEnabled, highContrast, updateSessionProfile]);

  return {
    isEditing,
    setIsEditing,
    nombre,
    setNombre,
    disability,
    setDisability,
    ttsEnabled,
    setTtsEnabled,
    highContrast,
    setHighContrast,
    errors,
    apiError,
    successMessage,
    submitting,
    startEditing,
    cancelEditing,
    submit,
  };
}
