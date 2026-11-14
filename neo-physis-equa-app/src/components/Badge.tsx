import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface BadgeStyle {
  container: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  hcContainer: string;
  hcText: string;
  hcIconColor: string;
}

const DEFAULT_STYLE: BadgeStyle = {
  container: 'bg-crema border border-turquesa',
  text: 'text-tinta',
  icon: 'information-circle-outline',
  iconColor: colors.tinta,
  hcContainer: 'bg-turquesa border border-crema',
  hcText: 'text-crema',
  hcIconColor: colors.crema,
};

const BADGE_STYLES: Record<string, BadgeStyle> = {
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
  activo: {
    container: 'bg-azul',
    text: 'text-crema',
    icon: 'checkmark-done-circle',
    iconColor: colors.crema,
    hcContainer: 'bg-crema',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  inactivo: {
    container: 'bg-crema border border-turquesa',
    text: 'text-tinta',
    icon: 'remove-circle-outline',
    iconColor: colors.tinta,
    hcContainer: 'bg-turquesa border border-crema',
    hcText: 'text-crema',
    hcIconColor: colors.crema,
  },
  pendiente: {
    container: 'bg-alerta-bg border border-lima',
    text: 'text-tinta',
    icon: 'time-outline',
    iconColor: colors.tinta,
    hcContainer: 'bg-lima',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  resuelto: {
    container: 'bg-exito-bg border border-verde',
    text: 'text-tinta',
    icon: 'checkmark-circle',
    iconColor: colors.tinta,
    hcContainer: 'bg-verde',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  vegetativo: {
    container: 'bg-exito-bg border border-verde',
    text: 'text-tinta',
    icon: 'leaf',
    iconColor: colors.tinta,
    hcContainer: 'bg-verde',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  'floración': {
    container: 'bg-alerta-bg border border-lima',
    text: 'text-tinta',
    icon: 'flower',
    iconColor: colors.tinta,
    hcContainer: 'bg-lima',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  'fructificación': {
    container: 'bg-lima',
    text: 'text-tinta',
    icon: 'nutrition',
    iconColor: colors.tinta,
    hcContainer: 'bg-lima',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
  'producción': {
    container: 'bg-azul',
    text: 'text-crema',
    icon: 'trending-up',
    iconColor: colors.crema,
    hcContainer: 'bg-crema',
    hcText: 'text-tinta',
    hcIconColor: colors.tinta,
  },
};

export default function Badge({ value }: { value: string }) {
  const { highContrast } = useAccessibility();
  const style = BADGE_STYLES[value] ?? DEFAULT_STYLE;
  const container = highContrast ? style.hcContainer : style.container;
  const text = highContrast ? style.hcText : style.text;
  const iconColor = highContrast ? style.hcIconColor : style.iconColor;

  return (
    <View
      accessibilityLabel={`Estado ${value}`}
      className={`shrink flex-row items-center gap-1 self-start rounded-chip px-2.5 py-1 ${container}`}
    >
      <Ionicons name={style.icon} size={12} color={iconColor} />
      <Text className={`text-[10px] font-inter-bold ${text}`}>{value}</Text>
    </View>
  );
}
