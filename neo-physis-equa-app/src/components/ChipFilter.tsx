import { Text, View } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import Chip from './Chip';

export interface ChipFilterOption {
  value: string;
  label: string;
}

interface ChipFilterProps {
  label: string;
  options: ChipFilterOption[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
  empty?: string;
}

export default function ChipFilter({
  label,
  options,
  selected,
  onSelect,
  empty = 'Sin opciones disponibles',
}: ChipFilterProps) {
  const { palette } = useAccessibility();

  return (
    <View className="mb-4 gap-1.5">
      <Text className={`${type.label} ${palette.title}`}>{label}</Text>
      {options.length === 0 ? (
        <Text className={`${type.caption} ${palette.sub}`}>{empty}</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {options.map((option) => {
            const active = String(option.value) === String(selected);
            return (
              <Chip
                key={String(option.value)}
                label={option.label}
                accessibilityLabel={`${label}: ${option.label}`}
                selected={active}
                onPress={() => onSelect(active ? undefined : String(option.value))}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
