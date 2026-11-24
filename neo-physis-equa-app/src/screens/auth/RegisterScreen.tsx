import { Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Field from '../../components/Field';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import AuthHeader from './components/AuthHeader';
import DisabilitySelector from './components/DisabilitySelector';
import AccessibilityPreferences from './components/AccessibilityPreferences';
import { useAccessibility } from '../../accessibility/context';
import { REGISTER_FIELD_RULES } from '../../utils/auth-validators';
import { useRegister } from '../../hooks/useRegister';
import { type } from '../../theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccessibility();
  const {
    control,
    disability,
    setDisability,
    ttsEnabled,
    setTtsEnabled,
    highContrast,
    setHighContrast,
    loading,
    error,
    submit,
    dismissError,
  } = useRegister();

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader subtitle="Crea tu cuenta para comenzar." />

        <View className="-mt-8 gap-4 px-6">
          {error && (
            <Notice variant="error" onDismiss={dismissError}>
              {error}
            </Notice>
          )}

          <Card className="gap-5">
            <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
              Tus datos
            </Text>
            <Field
              control={control}
              name="nombre"
              label="Nombre"
              icon="person-outline"
              placeholder="Tu nombre completo"
              autoCapitalize="words"
              autoCorrect={false}
              rules={REGISTER_FIELD_RULES.nombre}
            />
            <Field
              control={control}
              name="email"
              label="Email"
              icon="mail-outline"
              placeholder="tucorreo@ejemplo.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              rules={REGISTER_FIELD_RULES.email}
            />
            <Field
              control={control}
              name="password"
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
              rules={REGISTER_FIELD_RULES.password}
            />
          </Card>

          <Card className="gap-5">
            <View className="gap-1">
              <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
                Accesibilidad
              </Text>
              <Text className={`${type.caption} ${palette.sub}`}>
                La app se adapta a tu perfil. Puedes cambiarlo después desde Mi perfil.
              </Text>
            </View>
            <DisabilitySelector value={disability} onChange={setDisability} />
            <AccessibilityPreferences
              ttsEnabled={ttsEnabled}
              highContrast={highContrast}
              onTtsChange={setTtsEnabled}
              onHighContrastChange={setHighContrast}
            />
          </Card>

          <Button
            text={loading ? 'Registrando…' : 'Registrarse'}
            icon="person-add-outline"
            onPress={submit(() => router.replace('/login'))}
            disabled={loading}
          />

          <Link href="/login" asChild>
            <Pressable
              className="min-h-12 items-center justify-center rounded-boton active:opacity-70"
              accessibilityLabel="¿Ya tienes cuenta? Inicia sesión"
              accessibilityRole="link"
              accessibilityHint="Abre la pantalla de inicio de sesión"
            >
              <Text className={`text-center ${type.body} ${palette.sub}`}>
                ¿Ya tienes cuenta? <Text className="font-inter-bold underline">Inicia sesión</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
