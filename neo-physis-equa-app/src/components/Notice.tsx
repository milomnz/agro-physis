import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useAccessibility } from '../accessibility/context';
import { colors } from '../theme/tokens';

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
  onDismiss?: () => void;
  autoDismissMs?: number;
}

// Aviso con la misma regla del Badge: color + ícono + texto, nunca color solo.
export default function Notice({
  variant,
  children,
  className = '',
  onDismiss,
  autoDismissMs,
}: NoticeProps) {
  const { highContrast, palette } = useAccessibility();
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const hasDismiss = Boolean(onDismiss);

  useEffect(() => {
    if (!autoDismissMs || !hasDismiss) return;
    const timerId = setTimeout(() => {
      onDismissRef.current?.();
    }, autoDismissMs);
    return () => clearTimeout(timerId);
  }, [autoDismissMs, children, hasDismiss]);

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

  const closeColor = highContrast ? colors.crema : colors.tinta;

  return (
    <View
      accessibilityRole="alert"
      className={`flex-row items-center gap-2 rounded-campo p-3 ${container} ${className}`}
    >
      <Ionicons name={ICONS[variant]} size={18} color={iconColor} />
      <Text className={`flex-1 text-sm font-inter-semibold ${palette.errorText}`}>{children}</Text>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          className="-my-2 -mr-2 min-h-12 min-w-12 items-center justify-center rounded-boton active:opacity-70"
        >
          <Ionicons name="close" size={18} color={closeColor} />
        </Pressable>
      ) : null}
    </View>
  );
}
