import { Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import Button from '../../components/Button';
import Field from '../../components/Field';
import Notice from '../../components/Notice';
import AuthHeader from './components/AuthHeader';
import DisabilitySelector from './components/DisabilitySelector';
import AccessibilityPreferences from './components/AccessibilityPreferences';
import { REGISTER_FIELD_RULES } from '../../utils/auth-validators';
import { useRegister } from '../../hooks/useRegister';

export default function RegisterScreen() {
  const router = useRouter();
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
  } = useRegister();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-crema">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Neo Physis Equa"
          subtitle="Crea tu cuenta para comenzar"
          titleClassName="mb-1 text-3xl"
          subtitleClassName="mb-8 text-sm"
        />

        {error && (
          <Notice variant="error" className="mb-4">
            {error}
          </Notice>
        )}

        <View className="mb-6 gap-5">
          <Field
            control={control}
            name="nombre"
            label="Nombre"
            placeholder="Tu nombre completo"
            autoCapitalize="words"
            autoCorrect={false}
            rules={REGISTER_FIELD_RULES.nombre}
          />
          <Field
            control={control}
            name="email"
            label="Email"
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            rules={REGISTER_FIELD_RULES.password}
          />
        </View>

        <DisabilitySelector value={disability} onChange={setDisability} />

        <AccessibilityPreferences
          ttsEnabled={ttsEnabled}
          highContrast={highContrast}
          onTtsChange={setTtsEnabled}
          onHighContrastChange={setHighContrast}
        />

        <Button
          text={loading ? 'Registrando…' : 'Registrarse'}
          onPress={submit(() => router.replace('/login'))}
          disabled={loading}
        />

        <Link href="/login" asChild>
          <Pressable
            className="mt-4 min-h-12 items-center justify-center"
            accessibilityLabel="¿Ya tienes cuenta? Inicia sesión"
            accessibilityRole="link"
            accessibilityHint="Abre la pantalla de inicio de sesión"
          >
            <Text className="text-center text-turquesa">¿Ya tienes cuenta? Inicia sesión</Text>
          </Pressable>
        </Link>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
