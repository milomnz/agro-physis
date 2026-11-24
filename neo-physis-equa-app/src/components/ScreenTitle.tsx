import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import IconBadge from './IconBadge';

interface ScreenTitleProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Acción a la derecha del título (p. ej. el botón "Nuevo"). */
  action?: ReactNode;
}

/** Encabezado de contenido de cada pantalla; el lector de pantalla lo anuncia como título. */
export default function ScreenTitle({ title, subtitle, icon, action }: ScreenTitleProps) {
  const { palette } = useAccessibility();

  return (
    <View className="flex-row items-center gap-4">
      {icon ? <IconBadge icon={icon} /> : null}
      <View className="flex-1 gap-1">
        <Text accessibilityRole="header" className={`${type.title} ${palette.title}`}>
          {title}
        </Text>
        {subtitle ? <Text className={`${type.caption} ${palette.sub}`}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}
