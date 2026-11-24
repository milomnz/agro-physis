import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { colors, gradients } from '../theme/tokens';

const SIZES = { md: 48, lg: 72 } as const;

interface IconBadgeProps {
  icon?: keyof typeof Ionicons.glyphMap;
  /** Letra o cifra en lugar del ícono (p. ej. la inicial del perfil). */
  text?: string;
  size?: keyof typeof SIZES;
}

/**
 * Medallón con forma de hoja: la forma orgánica que el manual permite en lo decorativo.
 * Va oculto al lector de pantalla; el texto que lo acompaña es el que informa.
 */
export default function IconBadge({ icon = 'leaf', text, size = 'md' }: IconBadgeProps) {
  const dim = SIZES[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
      style={{
        width: dim,
        height: dim,
        borderTopLeftRadius: dim / 2,
        borderBottomRightRadius: dim / 2,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: colors.verde,
        backgroundImage: gradients.leaf,
      }}
    >
      {text ? (
        <Text className={`font-bricolage text-tinta ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
          {text}
        </Text>
      ) : (
        <Ionicons name={icon} size={dim / 2} color={colors.tinta} />
      )}
    </View>
  );
}
