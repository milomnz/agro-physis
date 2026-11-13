import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { colors } from '../theme/tokens';

export interface AppPalette {
  bg: string;
  card: string;
  title: string;
  body: string;
  sub: string;
  faint: string;
  chipBg: string;
  errorBanner: string;
  successBanner: string;
  warningBanner: string;
  errorText: string;
  fieldErrorBorder: string;
  iconError: string;
  iconSuccess: string;
  iconWarning: string;
  spinner: string;
}

export const buildPalette = (highContrast: boolean): AppPalette =>
  highContrast
    ? {
        bg: 'bg-noche',
        card: 'bg-turquesa border-2 border-crema',
        title: 'text-crema',
        body: 'text-crema',
        sub: 'text-crema/80',
        faint: 'text-crema/60',
        chipBg: 'bg-crema text-noche',
        errorBanner: 'bg-noche border-2 border-tierra text-crema',
        successBanner: 'bg-noche border-2 border-verde text-crema',
        warningBanner: 'bg-noche border-2 border-lima text-crema',
        errorText: 'text-crema',
        fieldErrorBorder: 'border-tierra',
        iconError: colors.crema,
        iconSuccess: colors.verde,
        iconWarning: colors.lima,
        spinner: colors.crema,
      }
    : {
        bg: 'bg-crema',
        card: 'bg-crema border border-turquesa',
        title: 'text-tinta',
        body: 'text-tinta',
        sub: 'text-azul',
        faint: 'text-azul/70',
        chipBg: 'bg-crema text-tinta border border-turquesa',
        errorBanner: 'bg-error-bg border-2 border-tierra text-tinta',
        successBanner: 'bg-exito-bg border-2 border-verde text-tinta',
        warningBanner: 'bg-alerta-bg border-2 border-lima text-tinta',
        errorText: 'text-tinta',
        fieldErrorBorder: 'border-tierra',
        iconError: colors.tinta,
        iconSuccess: colors.tinta,
        iconWarning: colors.tinta,
        spinner: colors.azul,
      };

interface AccessibilityContextValue {
  highContrast: boolean;
  palette: AppPalette;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  highContrast: false,
  palette: buildPalette(false),
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();

  const highContrast = session?.accessibilityProfile?.highContrast === true;

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, palette: buildPalette(highContrast) }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
