import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { detenerVoz, hablar, type SpeakOptions } from '../services/speech';
import { buildPalette, type AppPalette } from '../theme/palette';

interface AccessibilityContextValue {
  highContrast: boolean;
  palette: AppPalette;
  //Perfil auditivo: Confirma las acciones con vibración y alerta visual.
  actionFeedback?: boolean;
  // Perfil visual / TTS: Lee en voz alta títulos, confirmaciones y diagnósticos.
  ttsEnabled: boolean;
  speak: (text: string, options?: SpeakOptions) => void;
  stopSpeech: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  highContrast: false,
  palette: buildPalette(false),
  actionFeedback: false,
  ttsEnabled: false,
  speak: () => {},
  stopSpeech: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();

  const highContrast = session?.accessibilityProfile?.highContrast === true;
  const actionFeedback = session?.disabilityType === 'auditiva';
  const ttsEnabled = session?.accessibilityProfile?.ttsEnabled === true;

  useEffect(() => {
    if (!ttsEnabled || !session?.token) {
      detenerVoz(true);
    }
  }, [ttsEnabled, session?.token]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!ttsEnabled) return;
      hablar(text, options);
    },
    [ttsEnabled],
  );

  const stopSpeech = useCallback(() => {
    detenerVoz();
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        palette: buildPalette(highContrast),
        actionFeedback,
        ttsEnabled,
        speak,
        stopSpeech,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
