import TextField from './TextField';

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
  return (
    <TextField
      icon="search"
      accessibilityLabel={label}
      accessibilityRole="search"
      accessibilityHint={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      returnKeyType="search"
      className="mb-4"
    />
  );
}
