import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, View } from 'react-native';
import { useAccessibility } from '../../../accessibility/context';
import { colors, type } from '../../../theme/tokens';

interface AccessibilityPreferencesProps {
  ttsEnabled: boolean;
  highContrast: boolean;
  onTtsChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
}

interface PreferenceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

// El estado se lee también como texto ("Sí"/"No"), no solo por el color del interruptor.
function PreferenceRow({ icon, label, value, onChange }: PreferenceRowProps) {
  const { highContrast, palette } = useAccessibility();

  return (
    <View className="min-h-14 flex-row items-center gap-3">
      <Ionicons name={icon} size={22} color={palette.icon} />
      <Text className={`flex-1 ${type.body} ${palette.body}`}>{label}</Text>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        className={`text-sm font-inter-semibold ${palette.sub}`}
      >
        {value ? 'Sí' : 'No'}
      </Text>
      <View className="min-h-12 min-w-12 items-center justify-center">
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: highContrast ? colors.lima : colors.azul, false: colors.tierra }}
          thumbColor={colors.crema}
          hitSlop={10}
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
        />
      </View>
    </View>
  );
}

export default function AccessibilityPreferences({
  ttsEnabled,
  highContrast,
  onTtsChange,
  onHighContrastChange,
}: AccessibilityPreferencesProps) {
  const { palette } = useAccessibility();

  return (
    <View className="gap-2">
      <Text className={`${type.label} ${palette.title}`}>Preferencias de accesibilidad</Text>
      <PreferenceRow
        icon="volume-high-outline"
        label="Lectura en voz alta"
        value={ttsEnabled}
        onChange={onTtsChange}
      />
      <View className={`h-px ${palette.divider}`} />
      <PreferenceRow
        icon="contrast-outline"
        label="Alto contraste"
        value={highContrast}
        onChange={onHighContrastChange}
      />
    </View>
  );
}
