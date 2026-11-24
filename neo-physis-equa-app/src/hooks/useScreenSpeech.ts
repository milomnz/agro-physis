import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAccessibility } from '../accessibility/context';

export function useScreenSpeech(message: string | null | undefined, enabled = true): void {
  const { ttsEnabled, speak, stopSpeech } = useAccessibility();

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !ttsEnabled || !message?.trim()) {
        return;
      }

      speak(message);

      return () => {
        stopSpeech();
      };
    }, [enabled, ttsEnabled, message, speak, stopSpeech]),
  );
}