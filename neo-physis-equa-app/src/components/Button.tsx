import { Pressable, Text } from 'react-native';
import { useAccessibility } from '../accessibility/context';

interface ButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  danger?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  text,
  onPress,
  disabled,
  secondary,
  danger,
  className = '',
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { highContrast } = useAccessibility();

  const containerClass = danger
    ? highContrast
      ? 'border-2 border-tierra bg-noche'
      : 'border-2 border-tierra bg-error-bg'
    : secondary
      ? highContrast
        ? 'border-2 border-crema'
        : 'border-2 border-turquesa'
      : highContrast
        ? 'bg-crema border-2 border-crema'
        : 'bg-turquesa border-2 border-turquesa';

  const textClass = danger
    ? highContrast
      ? 'text-crema'
      : 'text-tinta'
    : secondary
      ? highContrast
        ? 'text-crema'
        : 'text-turquesa'
      : highContrast
        ? 'text-noche'
        : 'text-crema';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      className={`min-h-12 min-w-12 items-center justify-center rounded-boton p-4 active:opacity-80 disabled:opacity-50 ${containerClass} ${className}`}
    >
      <Text className={`font-bricolage ${textClass}`}>{text}</Text>
    </Pressable>
  );
}
