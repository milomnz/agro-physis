import { Pressable, Text } from 'react-native';

import { useAccessibility } from '../../../accessibility/context';
import { colors } from '../../../theme/tokens';

interface OptionButtonProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  onPress: () => void;
}

/** Opción grande de respuesta: al menos 64 de alto y el texto hace salto de línea. */
export default function OptionButton({ label, sublabel, selected = false, onPress }: OptionButtonProps) {
  const { highContrast } = useAccessibility();

  const background = selected
    ? highContrast
      ? colors.crema
      : colors.azul
    : highContrast
      ? colors.tinta
      : '#FFFFFF';
  const border = highContrast ? colors.crema : colors.azul;
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
      style={{ backgroundColor: background, borderColor: border }}
      className="min-h-[64px] justify-center rounded-2xl border-2 px-5 py-4 active:opacity-70"
    >
      <Text className="text-lg font-inter-semibold" style={{ color: textColor }}>
        {label}
      </Text>
      {sublabel ? (
        <Text className="mt-0.5 text-sm" style={{ color: textColor }}>
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}