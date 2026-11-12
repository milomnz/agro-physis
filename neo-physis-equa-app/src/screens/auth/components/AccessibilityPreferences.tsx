import { Switch, Text, View } from 'react-native';

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
      <View className="rounded-2xl border border-turquesa bg-white p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm text-noche">Lectura en voz alta</Text>
          <View className="min-h-[48px] min-w-[48px] items-center justify-center">
            <Switch
              value={ttsEnabled}
              onValueChange={onTtsChange}
              trackColor={{ true: '#17536D', false: '#6B979A' }}
              thumbColor="#F3F4F4"
              hitSlop={10}
              accessibilityLabel="Lectura en voz alta"
            />
          </View>
        </View>
        <View className="my-3 h-px bg-turquesa/20" />
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm text-noche">Alto contraste</Text>
          <View className="min-h-[48px] min-w-[48px] items-center justify-center">
            <Switch
              value={highContrast}
              onValueChange={onHighContrastChange}
              trackColor={{ true: '#17536D', false: '#6B979A' }}
              thumbColor="#F3F4F4"
              hitSlop={10}
              accessibilityLabel="Alto contraste"
            />
          </View>
        </View>
      </View>
    </View>
  );
}