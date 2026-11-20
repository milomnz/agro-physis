import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAccessibility } from '../accessibility/context';

interface FeedbackContextValue {
  notifySuccess: (message: string) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  notifySuccess: () => {},
});

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const { actionFeedback } = useAccessibility();

    const notifySuccess = useCallback(
        (_message: string) => {
        if (!actionFeedback) return;
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        },
        [actionFeedback],
    );

  const value = useMemo(() => ({ notifySuccess }), [notifySuccess]);

    return (
        <FeedbackContext.Provider value={value}>
        {children}
        </FeedbackContext.Provider>
    );
}

export function useActionFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext);
}