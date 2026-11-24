import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, type } from '../theme/tokens';
import IconBadge from './IconBadge';

/** Fondo de los encabezados de navegación (Stack y Drawer): mismo degradado que el héroe. */
export function HeaderBackground() {
  return <View style={{ flex: 1, backgroundColor: colors.azul, backgroundImage: gradients.brand }} />;
}

interface BrandHeroProps {
  title: string;
  subtitle?: string;
  /** Línea corta sobre el título (Lima sobre el degradado: ≥ 5.3:1). */
  eyebrow?: string;
  /** Reemplaza el medallón de la hoja (p. ej. la inicial del perfil). */
  badge?: ReactNode;
  /** A todo lo ancho, bajo la barra de estado y con la curva suave inferior del manual. */
  bleed?: boolean;
  children?: ReactNode;
}

export default function BrandHero({
  title,
  subtitle,
  eyebrow,
  badge,
  bleed = false,
  children,
}: BrandHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`gap-2 overflow-hidden p-6 ${bleed ? 'pb-12' : 'rounded-tarjeta'}`}
      style={[
        { backgroundColor: colors.azul, backgroundImage: gradients.brand },
        bleed && {
          paddingTop: insets.top + 24,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        },
      ]}
    >
      {badge ?? <IconBadge icon="leaf" size="lg" />}
      {eyebrow ? (
        <Text className="mt-2 text-sm font-inter-semibold text-lima">{eyebrow}</Text>
      ) : null}
      <Text accessibilityRole="header" className={`${type.display} text-crema`}>
        {title}
      </Text>
      {subtitle ? <Text className={`${type.body} text-crema/90`}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}
