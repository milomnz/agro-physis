import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';

export type NoticeVariant = 'error' | 'success' | 'warning';

const ICONS: Record<NoticeVariant, keyof typeof Ionicons.glyphMap> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  warning: 'warning',
};

interface NoticeProps {
  variant: NoticeVariant;
  children: string;
  className?: string;
}

// Aviso con la misma regla del Badge: color + ícono + texto, nunca color solo.
export default function Notice({ variant, children, className = '' }: NoticeProps) {
  const { palette } = useAccessibility();

  const container =
    variant === 'error'
      ? palette.errorBanner
      : variant === 'success'
        ? palette.successBanner
        : palette.warningBanner;

  const iconColor =
    variant === 'error'
      ? palette.iconError
      : variant === 'success'
        ? palette.iconSuccess
        : palette.iconWarning;

  return (
    <View
      accessibilityRole="alert"
      className={`flex-row items-center gap-2 rounded-campo p-3 ${container} ${className}`}
    >
      <Ionicons name={ICONS[variant]} size={18} color={iconColor} />
      <Text className={`flex-1 text-sm font-inter-semibold ${palette.errorText}`}>{children}</Text>
    </View>
  );
}
