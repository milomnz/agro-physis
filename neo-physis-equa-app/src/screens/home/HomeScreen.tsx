import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import BrandHero from '../../components/BrandHero';
import Button from '../../components/Button';
import Card from '../../components/Card';
import IconBadge from '../../components/IconBadge';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { useAccessibility } from '../../accessibility/context';
import { useRequireSession } from '../../hooks/useRequireSession';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { useSession } from '../../hooks/useSession';
import { space, type } from '../../theme/tokens';

const SHORTCUTS: {
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}[] = [
  { href: '/farms', icon: 'leaf', title: 'Mis Fincas', description: 'Terrenos, ubicación y altitud' },
  { href: '/crops', icon: 'nutrition', title: 'Mis Cultivos', description: 'Especies y etapas de crecimiento' },
  { href: '/pests', icon: 'bug', title: 'Catálogo de Plagas', description: 'Síntomas y severidad por cultivo' },
  { href: '/profile', icon: 'person', title: 'Mi perfil', description: 'Datos y preferencias de accesibilidad' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccessibility();
  const sessionReady = useRequireSession();
  const { session, loading } = useSession();

  useScreenSpeech(
    session?.nombre
      ? `Inicio. Hola, ${session.nombre}. Gestiona tus fincas, cultivos y plagas desde aquí o desde el menú lateral.`
      : null,
    !loading && sessionReady && Boolean(session?.token),
  );

  if (loading || !sessionReady || !session?.token) {
    return <LoadingView label="Cargando tu inicio…" />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-4"
        contentContainerStyle={{ padding: space.gutter, paddingBottom: insets.bottom + space.gutter }}
      >
        <BrandHero
          eyebrow="Agro Physis"
          title={`Hola, ${session.nombre}`}
          subtitle="Gestiona tus fincas, cultivos y plagas desde aquí o desde el menú lateral."
        >
          <Button
            text="Diagnosticar síntomas"
            icon="medkit-outline"
            secondary // superficie clara: contrasta con el degradado oscuro del héroe
            onPress={() => router.push('/diagnosis')}
            accessibilityHint="Abre el cuestionario para identificar plagas probables en un cultivo"
            className="mt-3"
          />
        </BrandHero>

        <Text accessibilityRole="header" className={`mt-2 ${type.heading} ${palette.title}`}>
          Tu campo
        </Text>

        {SHORTCUTS.map((item) => (
          <Card
            key={item.title}
            onPress={() => router.push(item.href)}
            accessibilityLabel={item.title}
            accessibilityHint={item.description}
          >
            <View className="flex-row items-center gap-4">
              <IconBadge icon={item.icon} />
              <View className="flex-1 gap-0.5">
                <Text className={`${type.subheading} ${palette.title}`}>{item.title}</Text>
                <Text className={`${type.caption} ${palette.sub}`}>{item.description}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
