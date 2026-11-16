import { Pressable, Text, View } from 'react-native';
import { useAccessibility } from '../../../accessibility/context';

export const DISABILITY_OPTIONS = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'motora', label: 'Motora' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'intelectual', label: 'Intelectual' },
];

interface DisabilitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  highContrast?: boolean;
}

export default function DisabilitySelector({
  value,
  onChange,
  highContrast: highContrastProp,
}: DisabilitySelectorProps) {
  const { highContrast: contextHighContrast } = useAccessibility();
  const isHC = highContrastProp ?? contextHighContrast;

  return (
    <View className="mb-6">
      <Text className={`mb-2 text-sm font-inter-semibold ${isHC ? 'text-crema' : 'text-noche'}`}>
        Tipo de discapacidad (opcional)
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {DISABILITY_OPTIONS.map((opt) => {
          const active = value === opt.value;
          const chipClass = active
            ? isHC
              ? 'border-crema bg-crema'
              : 'border-turquesa bg-turquesa'
            : isHC
              ? 'border-crema bg-noche'
              : 'border-turquesa bg-white';
          const textClass = active
            ? isHC
              ? 'text-noche'
              : 'text-crema'
            : isHC
              ? 'text-crema'
              : 'text-noche';

          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={`Tipo de discapacidad: ${opt.label}`}
              accessibilityState={{ selected: active }}
              className={`min-h-12 min-w-12 items-center justify-center rounded-chip border-2 px-4 py-2 active:opacity-80 ${chipClass}`}
            >
              <Text className={`text-xs font-inter-semibold ${textClass}`}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}