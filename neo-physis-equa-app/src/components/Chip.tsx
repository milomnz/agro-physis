import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Opción única de un grupo: se anuncia como radio en lugar de botón. */
  radio?: boolean;
}

/** Chip de selección. El estado activo se marca con color y con el ícono de check. */
export default function Chip({ label, selected, onPress, accessibilityLabel, radio = false }: ChipProps) {
  const { highContrast } = useAccessibility();

  const container = selected
    ? highContrast
      ? 'border-lima bg-lima'
      : 'border-azul bg-azul'
    : highContrast
      ? 'border-crema bg-tinta'
      : 'border-azul bg-papel';
  const onSelected = highContrast ? colors.tinta : colors.crema;
  const text = selected
    ? highContrast
      ? 'text-tinta'
      : 'text-crema'
    : highContrast
      ? 'text-crema'
      : 'text-tinta';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={radio ? 'radio' : 'button'}
      accessibilityState={radio ? { checked: selected } : { selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`min-h-12 min-w-12 flex-row items-center justify-center gap-1.5 rounded-chip border-2 px-4 py-2 active:opacity-70 ${container}`}
    >
      {selected ? <Ionicons name="checkmark" size={16} color={onSelected} /> : null}
      <Text className={`text-sm font-inter-semibold ${text}`}>{label}</Text>
    </Pressable>
  );
}
