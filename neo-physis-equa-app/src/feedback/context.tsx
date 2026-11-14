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

interface FeedbackContextValue {
  /**
   * Confirma una acción completada (crear, guardar, eliminar) con vibración
   * y una alerta visual. Solo actúa con el perfil auditivo; para el resto de
   * usuarios no hace nada.
   */
  notifySuccess: (message: string) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  notifySuccess: () => {},
});

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const { actionFeedback, highContrast } = useAccessibility();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Limpia el temporizador si el provider se desmonta.
    useEffect(
        () => () => {
        if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const notifySuccess = useCallback(
        (text: string) => {
        if (!actionFeedback) return;

        // La vibración no existe en web; en el móvil confirmamos con "éxito".
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }

        setMessage(text);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(null), VISIBLE_MS);
        },
        [actionFeedback],
    );

  const value = useMemo(() => ({ notifySuccess }), [notifySuccess]);

    return (
        <FeedbackContext.Provider value={value}>
        {children}
        {message ? (
            // Flota sobre la pantalla y no intercepta toques.
            <View
            className="absolute left-4 right-4"
            style={{ top: insets.top + 8, pointerEvents: 'none' }}
            >
            <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                className={`flex-row items-center gap-3 rounded-2xl border-2 p-4 ${
                highContrast ? 'border-green-300 bg-green-950' : 'border-green-700 bg-green-50'
                }`}
            >
                <Ionicons
                name="checkmark-circle"
                size={28}
                color={highContrast ? '#86EFAC' : '#15803D'}
                />
                <Text
                className={`flex-1 font-inter-semibold ${
                    highContrast ? 'text-green-300' : 'text-green-700'
                }`}
                >
                {message}
                </Text>
            </View>
            </View>
        ) : null}
        </FeedbackContext.Provider>
    );
}

export function useActionFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext);
}