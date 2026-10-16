import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';

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
        errorBanner: 'bg-red-950 text-red-300',
        successBanner: 'bg-green-950 text-green-300',
        spinner: '#F3F4F4',
      }
    : {
        bg: 'bg-crema',
        card: 'bg-white border border-turquesa',
        title: 'text-noche',
        body: 'text-noche',
        sub: 'text-turquesa',
        faint: 'text-turquesa/70',
        chipBg: 'bg-white text-noche',
        errorBanner: 'bg-red-50 text-red-700',
        successBanner: 'bg-green-50 text-green-700',
        spinner: '#17536D',
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