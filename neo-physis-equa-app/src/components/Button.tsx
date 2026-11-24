import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { colors, gradients } from '../theme/tokens';

interface ButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  danger?: boolean;
  /** Ícono que acompaña al texto; nunca lo reemplaza. */
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

type Variant = 'primary' | 'secondary' | 'danger';
// El primario no lleva borde: el degradado se repetiría bajo un borde transparente.
type Look = Record<Variant, { container: string; text: string; icon: string }>;

const LIGHT: Look = {
  primary: { container: 'bg-azul', text: 'text-crema', icon: colors.crema },
  secondary: { container: 'border-2 border-azul bg-papel', text: 'text-azul', icon: colors.azul },
  danger: { container: 'border-2 border-tierra bg-error-bg', text: 'text-tinta', icon: colors.tinta },
};

const HIGH_CONTRAST: Look = {
  primary: { container: 'bg-crema', text: 'text-tinta', icon: colors.tinta },
  secondary: { container: 'border-2 border-crema bg-tinta', text: 'text-crema', icon: colors.crema },
  danger: { container: 'border-2 border-tierra bg-tinta', text: 'text-crema', icon: colors.crema },
};

export default function Button({
  text,
  onPress,
  disabled,
  secondary,
  danger,
  icon,
  className = '',
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { highContrast } = useAccessibility();
  const variant: Variant = danger ? 'danger' : secondary ? 'secondary' : 'primary';
  const look = (highContrast ? HIGH_CONTRAST : LIGHT)[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      className={`min-h-14 min-w-12 flex-row items-center justify-center gap-2 rounded-boton px-5 py-3 active:opacity-80 disabled:opacity-50 ${look.container} ${className}`}
      style={
        variant === 'primary'
          ? { backgroundImage: highContrast ? gradients.actionHc : gradients.action }
          : undefined
      }
    >
      {icon ? <Ionicons name={icon} size={20} color={look.icon} /> : null}
      <Text className={`shrink text-center text-base font-bricolage ${look.text}`}>{text}</Text>
    </Pressable>
  );
}
