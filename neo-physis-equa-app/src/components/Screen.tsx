import { View, type ViewProps } from 'react-native';
import { useAccessibility } from '../accessibility/context';

/**
 * Raíz de cada pantalla. Pinta el degradado de la marca detrás de todo: decora, no informa,
 * y el texto conserva AA en cualquier punto del degradado.
 */
export default function Screen({ className = '', style, ...props }: ViewProps) {
  const { palette } = useAccessibility();

  return (
    <View
      {...props}
      className={`flex-1 ${className}`}
      style={[{ backgroundColor: palette.canvas, backgroundImage: palette.backdrop }, style]}
    />
  );
}
