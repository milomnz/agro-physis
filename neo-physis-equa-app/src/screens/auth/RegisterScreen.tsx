import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import AuthHeader from './components/AuthHeader';
import DisabilitySelector from './components/DisabilitySelector';
import AccessibilityPreferences from './components/AccessibilityPreferences';
import { useAccessibility } from '../../accessibility/context';
import { colors } from '../../theme/tokens';
import { useRegister, type AuthFieldName } from '../../hooks/useRegister';

export default function RegisterScreen() {
  const router = useRouter();
  const { palette } = useAccessibility();
  const {
    nombre,
    setNombre,
    email,
    setEmail,
    password,
    setPassword,
    disability,
    setDisability,
    ttsEnabled,
    setTtsEnabled,
    highContrast,
    setHighContrast,
    focusedField,
    setFocusedField,
    errors,
    loading,
    error,
    submit,
  } = useRegister();

  const handleSubmit = async () => {
    if (await submit()) {
      router.replace('/login');
    }
  };

  const inputClass = (field: AuthFieldName, hasError?: string) =>
    `rounded-campo border-2 bg-crema px-4 py-3 text-base text-noche ${
      hasError ? palette.fieldErrorBorder : focusedField === field ? 'border-noche' : 'border-turquesa'
    }`;

  const fieldError = (message?: string) =>
    message ? (
      <View className="mt-1 flex-row items-center gap-1">
        <Ionicons name="alert-circle" size={12} color={palette.iconError} />
        <Text className={`text-xs font-inter-semibold ${palette.errorText}`}>{message}</Text>
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-crema">
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

        <View className="mb-4">
          <Text className="mb-1 text-sm font-inter-semibold text-noche">Nombre</Text>
          <TextInput
            className={inputClass('nombre', errors.nombre)}
            placeholder="Tu nombre completo"
            placeholderTextColor={colors.azul}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoCorrect={false}
            onFocus={() => setFocusedField('nombre')}
            onBlur={() => setFocusedField(null)}
          />
          {fieldError(errors.nombre)}
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-inter-semibold text-noche">Email</Text>
          <TextInput
            className={inputClass('email', errors.email)}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={colors.azul}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          {fieldError(errors.email)}
        </View>

        <View className="mb-6">
          <Text className="mb-1 text-sm font-inter-semibold text-noche">Contraseña</Text>
          <TextInput
            className={inputClass('password', errors.password)}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.azul}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          {fieldError(errors.password)}
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
          onPress={handleSubmit}
          disabled={loading}
        />

        <Link href="/login" className="mt-4 text-center text-turquesa">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </KeyboardAwareScrollView>
    </View>
  );
}
