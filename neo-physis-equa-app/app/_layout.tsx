import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { AccessibilityProvider, useAccessibility } from '../src/accessibility/context';
import { SessionProvider } from '../src/session/context';
import { colors } from '../src/theme/tokens';
import '../global.css';

function RootStack() {
  const { highContrast } = useAccessibility();
  const bgColor = highContrast ? colors.tinta : colors.azul;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: bgColor },
        headerTintColor: colors.crema,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 18 },
        contentStyle: { backgroundColor: highContrast ? colors.tinta : colors.crema }
      }}
    >
      {/* 1. Flujo sin Header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      {/* 2. El Grupo Drawer (Ocultamos el header del Stack para que el Drawer muestre el suyo) */}
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

      {/* 3. Pantallas de Detalle (Stack nativo con flecha de volver automática) */}
      <Stack.Screen name="farms/[id]" options={{ title: 'Detalle de la Finca' }} />
      <Stack.Screen name="crops/new" options={{ title: 'Nuevo Cultivo' }} />
      <Stack.Screen name="crops/[id]" options={{ title: 'Detalle del Cultivo' }} />
      <Stack.Screen name="pests/new" options={{ title: 'Nueva Plaga' }} />
      <Stack.Screen name="pests/[id]" options={{ title: 'Detalle de la Plaga' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi perfil' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    BricolageGrotesque_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-crema">
        <ActivityIndicator size="large" color={colors.azul} />
      </View>
    );
  }

  return (
    <KeyboardProvider>
      <SessionProvider>
        <AccessibilityProvider>
          <RootStack />
        </AccessibilityProvider>
      </SessionProvider>
    </KeyboardProvider>
  );
}
