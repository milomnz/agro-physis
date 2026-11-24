import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useAccessibility } from '../accessibility/context';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Con onPress la tarjeta es un botón y muestra un chevron que anuncia que navega. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Card({
  children,
  className = '',
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { palette } = useAccessibility();
  const surface = `rounded-tarjeta p-5 ${palette.card} ${className}`;

  if (!onPress) {
    return (
      <View accessibilityLabel={accessibilityLabel} className={`gap-3 ${surface}`}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      className={`flex-row items-center gap-3 active:opacity-80 ${surface}`}
    >
      <View className="flex-1 gap-2">{children}</View>
      <Ionicons name="chevron-forward" size={22} color={palette.icon} />
    </Pressable>
  );
}
