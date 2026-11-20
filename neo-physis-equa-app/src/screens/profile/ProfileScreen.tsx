import { useCallback } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import { useAccessibility } from '../../accessibility/context';
import { colors } from '../../theme/tokens';
import { useEditProfile } from '../../hooks/useEditProfile';
import { useRequireSession } from '../../hooks/useRequireSession';
import { useSession } from '../../hooks/useSession';
import AccessibilityPreferences from '../auth/components/AccessibilityPreferences';
import DisabilitySelector from '../auth/components/DisabilitySelector';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast: themeHighContrast, palette, actionFeedback } = useAccessibility();
  const sessionReady = useRequireSession();
  const { session, loading, signOut } = useSession();
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
    focusedField,
    setFocusedField,
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

  const inputBorderClass = errors.nombre
    ? palette.fieldErrorBorder
    : focusedField === 'nombre'
      ? themeHighContrast
        ? 'border-crema'
        : 'border-noche'
      : themeHighContrast
        ? 'border-crema/70'
        : 'border-turquesa/50';

  const inputSurfaceClass = themeHighContrast ? 'bg-noche text-crema' : 'bg-crema text-tinta';

  return (
    <View className={`flex-1 ${palette.bg}`}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-2 pt-4">
          <View className="mb-2 min-h-[64px] min-w-[64px] items-center justify-center rounded-2xl bg-turquesa px-2">
            <Text className="text-2xl font-bricolage text-crema">{initial}</Text>
          </View>
          <Text className={`text-2xl font-bricolage ${palette.title}`}>Hola, {session.nombre}</Text>
          <Text className={`text-center text-sm ${palette.sub}`}>{session.email}</Text>
        </View>

        {successMessage ? (
          <Notice variant="success" className="mt-6">
            {successMessage}
          </Notice>
        ) : null}

        {apiError ? (
          <View accessibilityLiveRegion="assertive">
            <Notice variant="error" className="mt-6">
              {apiError}
            </Notice>
          </View>
        ) : null}

        {!isEditing ? (
          <>
            <View className={`mt-8 rounded-2xl p-5 ${palette.card}`}>
              <Text className={`mb-3 text-lg font-bricolage ${palette.title}`}>
                Mi perfil de accesibilidad
              </Text>
              <Text className={`mb-2 text-sm ${palette.sub}`}>
                Adaptaciones activas para tu experiencia
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Badge value={disability ?? 'ninguna'} />
                <Badge value={ttsEnabled ? 'activo' : 'inactivo'} />
                <Badge value={highContrast ? 'activo' : 'inactivo'} />
              </View>
              <View className="mt-3 gap-1">
                <Text className={`text-xs ${palette.sub}`}>
                  Tipo de discapacidad: {disability ?? 'ninguna'}
                </Text>
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
              <Button
                text="Editar perfil y accesibilidad"
                onPress={startEditing}
                accessibilityHint="Abre el formulario para editar tu nombre, tipo de discapacidad y preferencias de accesibilidad"
              />
              <Button
                text="Ir al inicio"
                onPress={() => router.replace('/home')}
                secondary
                accessibilityHint="Regresa a la pantalla principal de la aplicación"
              />
              <Button
                text="Cerrar sesión"
                onPress={handleLogout}
                danger
                accessibilityHint="Cierra tu sesión actual y vuelve al inicio de sesión"
              />
            </View>
          </>
        ) : (
          <View className={`mt-8 rounded-2xl p-5 ${palette.card}`}>
            <Text className={`mb-4 text-lg font-bricolage ${palette.title}`}>
              Editar perfil y accesibilidad
            </Text>

            <View className="mb-5">
              <Text className={`mb-1.5 text-sm font-inter-semibold ${palette.title}`}>
                Nombre completo
              </Text>
              <TextInput
                className={`min-h-[48px] rounded-xl border-2 px-4 py-3 text-base ${inputBorderClass} ${inputSurfaceClass}`}
                placeholder="Tu nombre completo"
                placeholderTextColor={themeHighContrast ? colors.crema : colors.azul}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                autoCorrect={false}
                accessibilityLabel="Nombre completo"
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.nombre ? (
                <Text className={`mt-1 text-xs ${palette.errorText}`}>
                  {errors.nombre}
                </Text>
              ) : null}
            </View>

            <DisabilitySelector
              value={editDisability}
              onChange={setDisability}
              highContrast={themeHighContrast}
            />

            <AccessibilityPreferences
              ttsEnabled={editTtsEnabled}
              highContrast={editHighContrast}
              onTtsChange={setTtsEnabled}
              onHighContrastChange={setHighContrast}
              themeHighContrast={themeHighContrast}
            />

            <View className="gap-3">
              <Button
                text={submitting ? 'Guardando…' : 'Guardar cambios'}
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
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}
