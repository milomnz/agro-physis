import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Campo de texto sin formulario. Foco = borde Tinta (Lima en alto contraste);
 * error = borde Tierra + ícono + mensaje, nunca solo color.
 */
export default function TextField({
  label,
  error,
  icon,
  className = '',
  multiline,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const { palette } = useAccessibility();
  const [focused, setFocused] = useState(false);

  const border = error
    ? palette.fieldErrorBorder
    : focused
      ? palette.inputFocus
      : palette.inputBorder;

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? <Text className={`${type.label} ${palette.title}`}>{label}</Text> : null}
      <View
        className={`flex-row rounded-campo border-2 ${multiline ? 'items-start' : 'items-center'} ${palette.input} ${border}`}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={palette.icon} style={{ marginLeft: 14 }} />
        ) : null}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={palette.placeholder}
          className={`flex-1 p-3.5 ${type.body} ${palette.body} ${multiline ? 'min-h-24' : 'min-h-12'}`}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
      </View>
      {error ? (
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="alert-circle" size={16} color={palette.iconError} />
          <Text className={`flex-1 text-sm font-inter-semibold ${palette.bannerText}`}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
