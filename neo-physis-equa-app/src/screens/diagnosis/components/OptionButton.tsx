import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useAccessibility } from '../../../accessibility/context';
import { colors } from '../../../theme/tokens';

interface OptionButtonProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  onPress: () => void;
}

/**
 * Opción grande de respuesta: al menos 64 de alto y el texto hace salto de línea.
 * Seleccionada = relleno + ícono de check, no solo color.
 */
export default function OptionButton({ label, sublabel, selected = false, onPress }: OptionButtonProps) {
  const { highContrast } = useAccessibility();

  const container = selected
    ? highContrast
      ? 'border-lima bg-lima'
      : 'border-azul bg-azul'
    : highContrast
      ? 'border-crema bg-tinta'
      : 'border-azul bg-papel';
  const textColor = selected
    ? highContrast
      ? colors.tinta
      : colors.crema
    : highContrast
      ? colors.crema
      : colors.tinta;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      accessibilityState={{ selected }}
      className={`min-h-16 flex-row items-center gap-3 rounded-tarjeta border-2 px-5 py-4 active:opacity-70 ${container}`}
    >
      <View className="flex-1">
        <Text className="text-lg font-inter-semibold" style={{ color: textColor }}>
          {label}
        </Text>
        {sublabel ? (
          <Text className="mt-0.5 text-sm font-inter" style={{ color: textColor }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'chevron-forward'}
        size={24}
        color={textColor}
      />
    </Pressable>
  );
}
