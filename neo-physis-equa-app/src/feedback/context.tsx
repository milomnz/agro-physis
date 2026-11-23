import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../accessibility/context';

// Tiempo que la alerta visual permanece en pantalla.
const VISIBLE_MS = 4000;

type FeedbackVariant = 'success' | 'warning';

interface FeedbackBannerState {
  text: string;
  variant: FeedbackVariant;
}

export interface FeedbackOptions {
  skipHaptics?: boolean;
}

interface FeedbackContextValue {
  /**
   * Confirma una acción completada (crear, guardar, eliminar) con vibración
   * y una alerta visual. Solo actúa con el perfil auditivo; para el resto de
   * usuarios no hace nada.
   */
  notifySuccess: (message: string) => void;
  /**
   * Muestra una alerta visual accesible de advertencia o notificación entrante
   * para el perfil auditivo, con vibración opcional.
   */
  notifyWarning: (message: string, options?: FeedbackOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  notifySuccess: () => {},
  notifyWarning: () => {},
});

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { actionFeedback, highContrast, speak } = useAccessibility();
  const insets = useSafeAreaInsets();
  const [banner, setBanner] = useState<FeedbackBannerState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpia el temporizador si el provider se desmonta.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const showBanner = useCallback((text: string, variant: FeedbackVariant) => {
    setBanner({ text, variant });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBanner(null), VISIBLE_MS);
  }, []);

  const notifySuccess = useCallback(
    (text: string) => {
      speak(text, { prioritario: true });
      if (!actionFeedback) return;

      // La vibración no existe en web; en el móvil confirmamos con "éxito".
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      showBanner(text, 'success');
    },
    [actionFeedback, showBanner, speak],
  );

  const notifyWarning = useCallback(
    (text: string, options?: FeedbackOptions) => {
      speak(text, { prioritario: true });
      if (!actionFeedback) return;

      if (!options?.skipHaptics && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }

      showBanner(text, 'warning');
    },
    [actionFeedback, showBanner, speak],
  );

  const value = useMemo(
    () => ({ notifySuccess, notifyWarning }),
    [notifySuccess, notifyWarning],
  );

  const isWarning = banner?.variant === 'warning';
  const containerClass = isWarning
    ? highContrast
      ? 'border-amber-300 bg-amber-950'
      : 'border-amber-700 bg-amber-50'
    : highContrast
      ? 'border-green-300 bg-green-950'
      : 'border-green-700 bg-green-50';
  const textClass = isWarning
    ? highContrast
      ? 'text-amber-200'
      : 'text-amber-900'
    : highContrast
      ? 'text-green-300'
      : 'text-green-700';
  const iconColor = isWarning
    ? highContrast
      ? '#FCD34D'
      : '#B45309'
    : highContrast
      ? '#86EFAC'
      : '#15803D';

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {banner ? (
        // Flota sobre la pantalla y no intercepta toques.
        <View
          className="absolute left-4 right-4"
          style={{ top: insets.top + 8, pointerEvents: 'none' }}
        >
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion={isWarning ? 'assertive' : 'polite'}
            className={`flex-row items-center gap-3 rounded-2xl border-2 p-4 ${containerClass}`}
          >
            <Ionicons
              name={isWarning ? 'notifications' : 'checkmark-circle'}
              size={28}
              color={iconColor}
            />
            <Text className={`flex-1 font-inter-semibold ${textClass}`}>{banner.text}</Text>
          </View>
        </View>
      ) : null}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext);
}

export function useActionFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext);
}
