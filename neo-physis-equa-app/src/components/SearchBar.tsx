import { useState } from 'react';
import { TextInput } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { highContrast } = useAccessibility();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      accessibilityLabel="Buscar"
      accessibilityHint={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={highContrast ? colors.crema + '80' : colors.azul}
      className={`mb-4 rounded-campo border-2 p-3.5 ${
        focused
          ? 'border-noche'
          : highContrast
            ? 'border-crema bg-noche text-crema'
            : 'border-turquesa bg-crema text-noche'
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
