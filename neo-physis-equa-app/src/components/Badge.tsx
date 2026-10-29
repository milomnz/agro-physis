import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface BadgeColor {
  light: string;
  dark: string;
}

// Estados generales (perfil, preferencias): se mantienen sin cambios.
const COLORS: Record<string, BadgeColor> = {
  activo: { light: 'bg-blue-50 text-blue-700', dark: 'bg-blue-950 text-blue-300' },
  inactivo: { light: 'bg-neutral-100 text-neutral-600', dark: 'bg-turquesa text-crema' },
  pendiente: { light: 'bg-amber-50 text-amber-700', dark: 'bg-amber-950 text-amber-300' },
  resuelto: { light: 'bg-green-50 text-green-700', dark: 'bg-green-950 text-green-300' },
};

interface SeverityStyle {
  container: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  hcContainer: string;
  hcText: string;
  hcIconColor: string;
}

// Severidad: paleta del manual, siempre color + ícono + texto.
// Verde Agro y Lima solo como relleno con texto Tinta (5.8:1 y 9.2:1).
const SEVERITY: Record<string, SeverityStyle> = {
  baja: {
    container: 'bg-verde',
    text: 'text-tinta',
    icon: 'checkmark-circle',
    iconColor: colors.tinta,
    hcContainer: 'bg-verde',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  media: {
    container: 'bg-lima',
    text: 'text-tinta',
    icon: 'alert-circle',
    iconColor: colors.tinta,
    hcContainer: 'bg-lima',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  alta: {
    container: 'bg-tinta',
    text: 'text-crema',
    icon: 'warning',
    iconColor: colors.crema,
    hcContainer: 'bg-crema',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
};

export default function Badge({ value }: { value: string }) {
  const { highContrast } = useAccessibility();
  const severity = SEVERITY[value];

  if (severity) {
    const container = highContrast ? severity.hcContainer : severity.container;
    const text = highContrast ? severity.hcText : severity.text;
    const iconColor = highContrast ? severity.hcIconColor : severity.iconColor;

    return (
      <View
        accessibilityLabel={`Severidad ${value}`}
        className={`flex-row items-center gap-1 self-start rounded-chip px-2.5 py-1 ${container}`}
      >
        <Ionicons name={severity.icon} size={12} color={iconColor} />
        <Text className={`text-[10px] font-inter-bold ${text}`}>{value}</Text>
      </View>
    );
  }

  const entry = COLORS[value] ?? COLORS.inactivo;
  const color = highContrast ? entry.dark : entry.light;
  return (
    <Text className={`self-start rounded-chip px-2.5 py-1 text-[10px] font-inter-bold ${color}`}>
      {value}
    </Text>
  );
}
