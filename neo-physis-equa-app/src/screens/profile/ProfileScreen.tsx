import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAccessibility } from '../../accessibility/context';
import { useRequireSession } from '../../hooks/useRequireSession';
import { useSession } from '../../hooks/useSession';

export default function ProfileScreen() {
  const router = useRouter();
  const { palette, actionFeedback } = useAccessibility();
  const sessionReady = useRequireSession();
  const { session, loading, signOut } = useSession();

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  if (loading || !sessionReady || !session?.token) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} />
      </View>
    );
  }

  const profile = session.accessibilityProfile ?? {};
  const ttsEnabled = profile.ttsEnabled === true;
  const highContrast = profile.highContrast === true;
  const disability =
    session.disabilityType && session.disabilityType !== 'ninguna'
      ? session.disabilityType
      : null;

  const initial = session.nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <ScrollView className={`flex-1 ${palette.bg}`} contentContainerClassName="p-6">
      <View className="items-center gap-2 pt-8">
        <View className="mb-2 min-h-[64px] min-w-[64px] items-center justify-center rounded-2xl bg-turquesa px-2">
          <Text className="text-2xl font-bricolage text-crema">{initial}</Text>
        </View>
        <Text className={`text-2xl font-bricolage ${palette.title}`}>Hola, {session.nombre}</Text>
        <Text className={`text-center ${palette.sub}`}>Has iniciado sesión correctamente</Text>
      </View>

      <View className={`mt-8 rounded-2xl p-5 ${palette.card}`}>
        <Text className={`mb-3 text-lg font-bricolage ${palette.title}`}>Mi perfil de accesibilidad</Text>
        <Text className={`mb-2 text-sm ${palette.sub}`}>
          Adaptaciones activas para tu experiencia
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {disability ? (
            <Badge value={disability} />
          ) : (
            <Text className={`rounded-full px-2.5 py-1 text-[10px] font-inter-bold ${palette.chipBg}`}>
              Discapacidad: ninguna
            </Text>
          )}
          <Badge value={ttsEnabled ? 'resuelto' : 'inactivo'} />
          <Badge value={highContrast ? 'activo' : 'inactivo'} />
        </View>
        <View className="mt-3 gap-1">
          <Text className={`text-xs ${palette.sub}`}>
            Lectura por voz (TTS): {ttsEnabled ? 'Activada' : 'Desactivada'}
          </Text>
          <Text className={`text-xs ${palette.sub}`}>
            Alto contraste: {highContrast ? 'Activado' : 'Desactivado'}
          </Text>
          <Text className={`text-xs ${palette.sub}`}>
            Vibración y alertas visuales: {actionFeedback ? 'Activadas' : 'Desactivadas'}
          </Text>
        </View>
      </View>

      <View className="mt-6 gap-3">
        <Button text="Cerrar sesión" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}