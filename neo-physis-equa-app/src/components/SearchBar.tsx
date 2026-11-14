import { useState } from 'react';
import { TextInput } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  label = 'Buscar',
}: SearchBarProps) {
  const { highContrast } = useAccessibility();
  const [focused, setFocused] = useState(false);

  const surfaceClass = highContrast ? 'bg-noche text-crema' : 'bg-crema text-noche';
  const borderClass = focused
    ? highContrast
      ? 'border-lima'
      : 'border-noche'
    : highContrast
      ? 'border-crema'
      : 'border-turquesa';

  return (
    <TextInput
      accessibilityLabel={label}
      accessibilityRole="search"
      accessibilityHint={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={highContrast ? colors.crema + '80' : colors.azul}
      className={`mb-4 min-h-12 rounded-campo border-2 p-3.5 ${surfaceClass} ${borderClass}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
