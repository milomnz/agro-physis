import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useAccessibility } from '../accessibility/context';
import { type } from '../theme/tokens';
import Card from './Card';
import IconBadge from './IconBadge';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  /** La acción que llena el vacío (normalmente un Button). */
  children?: ReactNode;
}

export default function EmptyState({ icon, title, message, children }: EmptyStateProps) {
  const { palette } = useAccessibility();

  return (
    <Card className="w-full items-center">
      <IconBadge icon={icon} size="lg" />
      <Text className={`text-center ${type.subheading} ${palette.title}`}>{title}</Text>
      <Text className={`text-center ${type.caption} ${palette.sub}`}>{message}</Text>
      {children ? <View className="mt-2 gap-3 self-stretch">{children}</View> : null}
    </Card>
  );
}
