import { Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Field from '../../components/Field';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import AuthHeader from './components/AuthHeader';
import { useAccessibility } from '../../accessibility/context';
import { LOGIN_FIELD_RULES, type LoginForm } from '../../utils/auth-validators';
import { useLogin } from '../../hooks/useLogin';
import { type } from '../../theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccessibility();
  const { loading, error, login, dismissError } = useLogin();

  const { control, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    if (await login(data)) {
      router.replace('/home');
    }
  };

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader subtitle="Gestiona tus fincas, cultivos y plagas en un solo lugar." />

        <View className="-mt-8 gap-4 px-6">
          <Card className="gap-5">
            <View className="gap-1">
              <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
                Inicia sesión
              </Text>
              <Text className={`${type.caption} ${palette.sub}`}>Entra con tu correo y contraseña.</Text>
            </View>

            {error && (
              <Notice variant="error" onDismiss={dismissError}>
                {error}
              </Notice>
            )}

            <Field
              control={control}
              name="email"
              label="Email"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="tucorreo@ejemplo.com"
              rules={LOGIN_FIELD_RULES.email}
            />
            <Field
              control={control}
              name="password"
              label="Contraseña"
              icon="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
              placeholder="Tu contraseña"
              rules={LOGIN_FIELD_RULES.password}
            />

            <Button
              text={loading ? 'Iniciando…' : 'Iniciar sesión'}
              icon="log-in-outline"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            />
          </Card>

          <Link href="/register" asChild>
            <Pressable
              className="min-h-12 items-center justify-center rounded-boton active:opacity-70"
              accessibilityLabel="¿No tienes cuenta? Regístrate"
              accessibilityRole="link"
              accessibilityHint="Abre la pantalla de registro"
            >
              <Text className={`text-center ${type.body} ${palette.sub}`}>
                ¿No tienes cuenta? <Text className="font-inter-bold underline">Regístrate</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
