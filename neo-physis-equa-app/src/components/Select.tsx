import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import Chip from './Chip';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: SelectOption[];
  empty?: string;
  rules?: RegisterOptions<T>;
}

export default function Select<T extends FieldValues>({
  control,
  name,
  label,
  options,
  empty,
  rules,
}: SelectProps<T>) {
  const { palette } = useAccessibility();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className={`${type.label} ${palette.title}`}>{label}</Text>
          {options.length === 0 ? (
            <Text className={`${type.caption} ${palette.sub}`}>
              {empty ?? 'Sin opciones disponibles'}
            </Text>
          ) : (
            <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
              {options.map((option) => (
                <Chip
                  key={String(option.value)}
                  radio
                  label={option.label}
                  accessibilityLabel={`${label}: ${option.label}`}
                  selected={String(option.value) === String(value)}
                  onPress={() => onChange(option.value)}
                />
              ))}
            </View>
          )}
          {error?.message && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="alert-circle" size={16} color={palette.iconError} />
              <Text className={`flex-1 text-sm font-inter-semibold ${palette.bannerText}`}>
                {error.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
}
