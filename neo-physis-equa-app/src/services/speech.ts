import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const DEFAULT_LANGUAGE = Platform.OS === 'android' ? 'es' : 'es-CO';
const DEFAULT_RATE = 0.95;
const DEDUPE_WINDOW_MS = 1500;
const PRIORITY_LOCK_MS = 2200;

let lastSpokenText = '';
let lastSpokenAt = 0;
let priorityUntil = 0;

export interface SpeakOptions {
  /** Si es true, protege este mensaje durante 2.2s para que un cambio de pantalla inmediato no lo corte. */
  prioritario?: boolean;
}

export function hablar(texto: string, opciones?: SpeakOptions): void {
  const limpio = texto.trim();
  if (!limpio) return;

  const now = Date.now();
  if (limpio === lastSpokenText && now - lastSpokenAt < DEDUPE_WINDOW_MS) {
    return;
  }

  lastSpokenText = limpio;
  lastSpokenAt = now;

  const enCola = !opciones?.prioritario && now < priorityUntil;
  if (opciones?.prioritario) {
    priorityUntil = now + PRIORITY_LOCK_MS;
  }

  try {
    if (enCola) {
      Speech.speak(limpio, {
        language: DEFAULT_LANGUAGE,
        rate: DEFAULT_RATE,
      });
      return;
    }

    void Speech.stop().finally(() => {
      Speech.speak(limpio, {
        language: DEFAULT_LANGUAGE,
        rate: DEFAULT_RATE,
      });
    });
  } catch (err) {
    console.warn('[speech] No se pudo reproducir la lectura por voz:', err);
  }
}

export function detenerVoz(forzar = false): void {
  if (!forzar && Date.now() < priorityUntil) {
    return;
  }
  try {
    void Speech.stop();
  } catch {
    // Ignorar si el motor de voz no estaba activo.
  }
}