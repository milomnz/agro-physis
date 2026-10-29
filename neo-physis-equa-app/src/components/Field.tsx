import { useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface FieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: RegisterOptions<T>;
}

export default function Field<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  ...inputProps
}: FieldProps<T>) {
  const { highContrast, palette } = useAccessibility();
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className={`font-inter-semibold ${highContrast ? 'text-crema' : 'text-noche'}`}>
            {label}
          </Text>
          <TextInput
            className={`rounded-campo border-2 p-3.5 ${
              error
                ? palette.fieldErrorBorder
                : focused
                  ? 'border-noche'
                  : highContrast
                    ? 'border-crema bg-noche text-crema'
                    : 'border-turquesa bg-crema text-noche'
            }`}
            placeholderTextColor={highContrast ? colors.crema + '80' : colors.azul}
            value={value ?? ''}
            {...inputProps}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur();
            }}
          />
          {error?.message && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="alert-circle" size={12} color={palette.iconError} />
              <Text className={`text-xs font-inter-semibold ${palette.errorText}`}>
                {error.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
}
