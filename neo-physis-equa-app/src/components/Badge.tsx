import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

type Tone = 'neutral' | 'brand' | 'ok' | 'okSoft' | 'warn' | 'warnSoft' | 'critical';

interface ToneStyle {
  container: string;
  text: string;
  icon: string;
}

// Tonos de la paleta (verde y lima solo como relleno con Tinta encima).
const TONES: Record<Tone, { light: ToneStyle; hc: ToneStyle }> = {
  neutral: {
    light: { container: 'bg-papel border border-azul', text: 'text-tinta', icon: colors.tinta },
    hc: { container: 'bg-azul border border-crema', text: 'text-crema', icon: colors.crema },
  },
  brand: {
    light: { container: 'bg-azul', text: 'text-crema', icon: colors.crema },
    hc: { container: 'bg-crema', text: 'text-tinta', icon: colors.tinta },
  },
  ok: {
    light: { container: 'bg-verde', text: 'text-tinta', icon: colors.tinta },
    hc: { container: 'bg-verde', text: 'text-tinta', icon: colors.tinta },
  },
  okSoft: {
    light: { container: 'bg-exito-bg border border-verde', text: 'text-tinta', icon: colors.tinta },
    hc: { container: 'bg-verde', text: 'text-tinta', icon: colors.tinta },
  },
  warn: {
    light: { container: 'bg-lima', text: 'text-tinta', icon: colors.tinta },
    hc: { container: 'bg-lima', text: 'text-tinta', icon: colors.tinta },
  },
  warnSoft: {
    light: { container: 'bg-alerta-bg border border-lima', text: 'text-tinta', icon: colors.tinta },
    hc: { container: 'bg-lima', text: 'text-tinta', icon: colors.tinta },
  },
  critical: {
    light: { container: 'bg-tinta', text: 'text-crema', icon: colors.crema },
    hc: { container: 'bg-crema', text: 'text-tinta', icon: colors.tinta },
  },
};

const DEFAULT_BADGE = { tone: 'neutral', icon: 'information-circle-outline' } as const;

// Valor nuevo del backend ⇒ entrada nueva aquí, no un color en la pantalla.
const BADGES: Record<string, { tone: Tone; icon: keyof typeof Ionicons.glyphMap }> = {
  baja: { tone: 'ok', icon: 'checkmark-circle' },
  media: { tone: 'warn', icon: 'alert-circle' },
  alta: { tone: 'critical', icon: 'warning' },
  activo: { tone: 'brand', icon: 'checkmark-done-circle' },
  inactivo: { tone: 'neutral', icon: 'remove-circle-outline' },
  pendiente: { tone: 'warnSoft', icon: 'time-outline' },
  resuelto: { tone: 'okSoft', icon: 'checkmark-circle' },
  vegetativo: { tone: 'okSoft', icon: 'leaf' },
  'floración': { tone: 'warnSoft', icon: 'flower' },
  'fructificación': { tone: 'warn', icon: 'nutrition' },
  'producción': { tone: 'brand', icon: 'trending-up' },
  ninguna: { tone: 'neutral', icon: 'remove-circle-outline' },
  motora: { tone: 'brand', icon: 'accessibility-outline' },
  visual: { tone: 'warnSoft', icon: 'eye-outline' },
  auditiva: { tone: 'okSoft', icon: 'ear-outline' },
  intelectual: { tone: 'neutral', icon: 'bulb-outline' },
};

interface BadgeProps {
  /** Valor que decide tono e ícono (severidad, etapa, estado…). */
  value: string;
  /** Texto visible si el valor crudo no se entiende solo (p. ej. "Activada"). */
  label?: string;
}

export default function Badge({ value, label }: BadgeProps) {
  const { highContrast } = useAccessibility();
  const badge = BADGES[value] ?? DEFAULT_BADGE;
  const style = TONES[badge.tone][highContrast ? 'hc' : 'light'];

  return (
    <View
      accessibilityLabel={label ?? `Estado ${value}`}
      className={`shrink flex-row items-center gap-1.5 self-start rounded-chip px-3 py-1 ${style.container}`}
    >
      <Ionicons name={badge.icon} size={14} color={style.icon} />
      <Text className={`text-xs font-inter-bold ${style.text}`}>{label ?? value}</Text>
    </View>
  );
}
