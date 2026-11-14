import { Switch, Text, View } from 'react-native';

import { colors } from '../../../theme/tokens';

interface AccessibilityPreferencesProps {
  ttsEnabled: boolean;
  highContrast: boolean;
  onTtsChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
}

export default function AccessibilityPreferences({
  ttsEnabled,
  highContrast,
  onTtsChange,
  onHighContrastChange,
}: AccessibilityPreferencesProps) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-inter-semibold text-noche">
        Preferencias de accesibilidad
      </Text>
      <View className="rounded-tarjeta border border-turquesa bg-crema p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm text-noche">Lectura en voz alta</Text>
          <View className="min-h-12 min-w-12 items-center justify-center">
            <Switch
              value={ttsEnabled}
              onValueChange={onTtsChange}
              trackColor={{ true: colors.azul, false: colors.tierra }}
              thumbColor={colors.crema}
              hitSlop={10}
              accessibilityLabel="Lectura en voz alta"
              accessibilityRole="switch"
            />
          </View>
        </View>
        <View className="my-3 h-px bg-turquesa/20" />
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm text-noche">Alto contraste</Text>
          <View className="min-h-12 min-w-12 items-center justify-center">
            <Switch
              value={highContrast}
              onValueChange={onHighContrastChange}
              trackColor={{ true: colors.azul, false: colors.tierra }}
              thumbColor={colors.crema}
              hitSlop={10}
              accessibilityLabel="Alto contraste"
              accessibilityRole="switch"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
