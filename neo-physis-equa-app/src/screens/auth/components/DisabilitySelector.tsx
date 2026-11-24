import { Text, View } from 'react-native';
import { useAccessibility } from '../../../accessibility/context';
import Chip from '../../../components/Chip';
import { type } from '../../../theme/tokens';

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
}

export default function DisabilitySelector({ value, onChange }: DisabilitySelectorProps) {
  const { palette } = useAccessibility();

  return (
    <View className="gap-2">
      <Text className={`${type.label} ${palette.title}`}>Tipo de discapacidad (opcional)</Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {DISABILITY_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            radio
            label={opt.label}
            accessibilityLabel={`Tipo de discapacidad: ${opt.label}`}
            selected={value === opt.value}
            onPress={() => onChange(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}
