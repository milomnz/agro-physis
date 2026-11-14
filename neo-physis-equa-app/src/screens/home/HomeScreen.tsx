import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Button from '../../components/Button';
import CenteredScroll from '../../components/CenteredScroll';
import { useAccessibility } from '../../accessibility/context';
import { useRequireSession } from '../../hooks/useRequireSession';
import { useSession } from '../../hooks/useSession';

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useAccessibility();
  const sessionReady = useRequireSession();
  const { session, loading } = useSession();

  if (loading || !sessionReady || !session?.token) {
    return (
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={{ flex: 1 }}
        className={`items-center justify-center ${palette.bg}`}
      >
        <ActivityIndicator color={palette.spinner} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }} className={palette.bg}>
      <CenteredScroll className={palette.bg} contentClassName="gap-6 p-6">
        <Text className={`text-2xl font-bricolage ${palette.title}`}>Hola, {session.nombre}</Text>
        <Text className={`text-center ${palette.sub}`}>
          Gestiona tus fincas, cultivos y plagas desde el menú lateral
        </Text>
        <Button text="Ir a mi perfil →" onPress={() => router.push('/profile')} />
        <Button text="Mis Fincas →" onPress={() => router.push('/farms')} />
      </CenteredScroll>
    </SafeAreaView>
  );
}