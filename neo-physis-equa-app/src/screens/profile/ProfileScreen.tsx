import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Badge from '../../components/Badge';
import BrandHero from '../../components/BrandHero';
import Button from '../../components/Button';
import Card from '../../components/Card';
import IconBadge from '../../components/IconBadge';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAccessibility } from '../../accessibility/context';
import { useEditProfile } from '../../hooks/useEditProfile';
import { useRequireSession } from '../../hooks/useRequireSession';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { useSession } from '../../hooks/useSession';
import { space, type } from '../../theme/tokens';
import AccessibilityPreferences from '../auth/components/AccessibilityPreferences';
import DisabilitySelector from '../auth/components/DisabilitySelector';

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  badgeLabel: string;
}

function ProfileRow({ icon, label, value, badgeLabel }: ProfileRowProps) {
  const { palette } = useAccessibility();

  return (
    <View className="min-h-12 flex-row items-center gap-3">
      <Ionicons name={icon} size={22} color={palette.icon} />
      <Text className={`flex-1 ${type.caption} ${palette.body}`}>{label}</Text>
      <Badge value={value} label={badgeLabel} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { palette, actionFeedback } = useAccessibility();
  const sessionReady = useRequireSession();
  const { session, loading, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const {
    isEditing,
    nombre,
    setNombre,
    disability: editDisability,
    setDisability,
    ttsEnabled: editTtsEnabled,
    setTtsEnabled,
    highContrast: editHighContrast,
    setHighContrast,
    errors,
    apiError,
    successMessage,
    submitting,
    startEditing,
    cancelEditing,
    submit,
  } = useEditProfile();

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  useScreenSpeech(
    session?.nombre ? `Mi perfil. Usuario ${session.nombre}.` : null,
    !loading && sessionReady && Boolean(session?.token),
  );

  if (loading || !sessionReady || !session?.token) {
    return <LoadingView label="Cargando tu perfil…" />;
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
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 20,
          padding: space.gutter,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <BrandHero
          badge={<IconBadge text={initial} size="lg" />}
          title={`Hola, ${session.nombre}`}
          subtitle={session.email}
        />

        {successMessage ? <Notice variant="success">{successMessage}</Notice> : null}
        {apiError ? <Notice variant="error">{apiError}</Notice> : null}

        {!isEditing ? (
          <>
            <Card>
              <View className="gap-1">
                <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
                  Mi perfil de accesibilidad
                </Text>
                <Text className={`${type.caption} ${palette.sub}`}>
                  Adaptaciones activas para tu experiencia
                </Text>
              </View>
              <ProfileRow
                icon="body-outline"
                label="Tipo de discapacidad"
                value={disability ?? 'ninguna'}
                badgeLabel={disability ?? 'ninguna'}
              />
              <View className={`h-px ${palette.divider}`} />
              <ProfileRow
                icon="volume-high-outline"
                label="Lectura por voz (TTS)"
                value={ttsEnabled ? 'activo' : 'inactivo'}
                badgeLabel={ttsEnabled ? 'Activada' : 'Desactivada'}
              />
              <View className={`h-px ${palette.divider}`} />
              <ProfileRow
                icon="contrast-outline"
                label="Alto contraste"
                value={highContrast ? 'activo' : 'inactivo'}
                badgeLabel={highContrast ? 'Activado' : 'Desactivado'}
              />
              <View className={`h-px ${palette.divider}`} />
              <ProfileRow
                icon="phone-portrait-outline"
                label="Vibración y alertas visuales"
                value={actionFeedback ? 'activo' : 'inactivo'}
                badgeLabel={actionFeedback ? 'Activadas' : 'Desactivadas'}
              />
            </Card>

            <View className="gap-3">
              <Button
                text="Editar perfil y accesibilidad"
                icon="create-outline"
                onPress={startEditing}
                accessibilityHint="Abre el formulario para editar tu nombre, tipo de discapacidad y preferencias de accesibilidad"
              />
              <Button
                text="Ir al inicio"
                icon="home-outline"
                onPress={() => router.replace('/home')}
                secondary
                accessibilityHint="Regresa a la pantalla principal de la aplicación"
              />
              <Button
                text="Cerrar sesión"
                icon="log-out-outline"
                onPress={handleLogout}
                danger
                accessibilityHint="Cierra tu sesión actual y vuelve al inicio de sesión"
              />
            </View>
          </>
        ) : (
          <Card className="gap-5">
            <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
              Editar perfil y accesibilidad
            </Text>

            <TextField
              label="Nombre completo"
              icon="person-outline"
              placeholder="Tu nombre completo"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              autoCorrect={false}
              error={errors.nombre}
            />

            <DisabilitySelector value={editDisability} onChange={setDisability} />

            <AccessibilityPreferences
              ttsEnabled={editTtsEnabled}
              highContrast={editHighContrast}
              onTtsChange={setTtsEnabled}
              onHighContrastChange={setHighContrast}
            />

            <View className="gap-3">
              <Button
                text={submitting ? 'Guardando…' : 'Guardar cambios'}
                icon="save-outline"
                onPress={submit}
                disabled={submitting}
                accessibilityHint="Guarda los cambios de tu perfil y preferencias de accesibilidad"
              />
              <Button
                text="Cancelar"
                onPress={cancelEditing}
                secondary
                disabled={submitting}
                accessibilityHint="Descarta los cambios y vuelve al resumen del perfil"
              />
            </View>
          </Card>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}
