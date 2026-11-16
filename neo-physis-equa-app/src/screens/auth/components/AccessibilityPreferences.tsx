import { Switch, Text, View } from 'react-native';
import { useAccessibility } from '../../../accessibility/context';

import { colors } from '../../../theme/tokens';

interface AccessibilityPreferencesProps {
  ttsEnabled: boolean;
  highContrast: boolean;
  onTtsChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  themeHighContrast?: boolean;
}

export default function AccessibilityPreferences({
  ttsEnabled,
  highContrast,
  onTtsChange,
  onHighContrastChange,
  themeHighContrast,
}: AccessibilityPreferencesProps) {
  const { highContrast: contextHighContrast } = useAccessibility();
  const isHC = themeHighContrast ?? contextHighContrast;

  return (
    <View className="mb-6">
      <Text className={`mb-2 text-sm font-inter-semibold ${isHC ? 'text-crema' : 'text-noche'}`}>
        Preferencias de accesibilidad
      </Text>
      <View
        className={`rounded-tarjeta p-4 ${
          isHC ? 'border-2 border-crema bg-turquesa' : 'border border-turquesa bg-crema'
        }`}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className={`flex-1 text-sm ${isHC ? 'text-crema' : 'text-noche'}`}>
            Lectura en voz alta
          </Text>
          <View className="min-h-12 min-w-12 items-center justify-center">
            <Switch
              value={ttsEnabled}
              onValueChange={onTtsChange}
              trackColor={{ true: isHC ? colors.tinta : colors.azul, false: colors.tierra }}
              thumbColor={colors.crema}
              hitSlop={10}
              accessibilityLabel="Lectura en voz alta"
              accessibilityRole="switch"
              accessibilityState={{ checked: ttsEnabled }}
            />
          </View>
        </View>
        <View className={`my-3 h-px ${isHC ? 'bg-crema/30' : 'bg-turquesa/20'}`} />
        <View className="flex-row items-center justify-between gap-3">
          <Text className={`flex-1 text-sm ${isHC ? 'text-crema' : 'text-noche'}`}>
            Alto contraste
          </Text>
          <View className="min-h-12 min-w-12 items-center justify-center">
            <Switch
              value={highContrast}
              onValueChange={onHighContrastChange}
              trackColor={{ true: isHC ? colors.tinta : colors.azul, false: colors.tierra }}
              thumbColor={colors.crema}
              hitSlop={10}
              accessibilityLabel="Alto contraste"
              accessibilityRole="switch"
              accessibilityState={{ checked: highContrast }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
