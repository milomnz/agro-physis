import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { buildPalette, type AppPalette } from '../theme/palette';

interface AccessibilityContextValue {
  highContrast: boolean;
  palette: AppPalette;
  //Perfil auditivo: Confirma las acciones con vibración y alerta visual.
  actionFeedback?: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  highContrast: false,
  palette: buildPalette(false),
  actionFeedback: false,
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();

  const highContrast = session?.accessibilityProfile?.highContrast === true;
  const actionFeedback = session?.disabilityType ==='auditiva';

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, palette: buildPalette(highContrast), actionFeedback }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
