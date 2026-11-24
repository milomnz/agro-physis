import { ActivityIndicator, Text } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import Screen from './Screen';

/** Pantalla de carga: dice qué se está cargando, no solo un spinner. */
export default function LoadingView({ label = 'Cargando…' }: { label?: string }) {
  const { palette } = useAccessibility();

  return (
    <Screen className="items-center justify-center gap-3 p-6">
      <ActivityIndicator size="large" color={palette.spinner} />
      <Text className={`text-center ${type.caption} ${palette.sub}`}>{label}</Text>
    </Screen>
  );
}
