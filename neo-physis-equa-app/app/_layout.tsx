import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { AccessibilityProvider, useAccessibility } from '../src/accessibility/context';
import { HeaderBackground } from '../src/components/BrandHero';
import LoadingView from '../src/components/LoadingView';
import { FeedbackProvider } from '../src/feedback/context';
import { useNotificationNavigation } from '../src/hooks/useNotificationNavigation';
import { useSession } from '../src/hooks/useSession';
import { SessionProvider } from '../src/session/context';
import { colors, fonts, motion } from '../src/theme/tokens';
import '../global.css';

function RootStack() {
  const { palette } = useAccessibility();
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useNotificationNavigation();

  useEffect(() => {
    if (loading) return;
    const hasToken = Boolean(session?.token);
    const firstSegment = segments[0] as string | undefined;
    const inAuthScreens = firstSegment === 'login' || firstSegment === 'register';
    const inIndex = !firstSegment || firstSegment === 'index';

    if (!hasToken && !inAuthScreens) {
      router.replace('/login');
    } else if (hasToken && (inAuthScreens || inIndex)) {
      router.replace('/home');
    }
  }, [loading, session, segments, router]);

  return (
    <>
      {/* Encabezados y héroes usan el degradado oscuro de la marca: íconos claros siempre. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerBackground: HeaderBackground,
          headerTintColor: colors.crema,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
          contentStyle: { backgroundColor: palette.canvas },
          // Misma transición suave en toda la app; ninguna si el sistema pide reducir movimiento.
          animation: reduceMotion ? 'none' : 'fade_from_bottom',
          animationDuration: motion.screenMs,
        }}
      >
        {/* 1. Flujo sin Header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* 2. El Grupo Drawer (Ocultamos el header del Stack para que el Drawer muestre el suyo) */}
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

        {/* 3. Pantallas de Detalle (Stack nativo con flecha de volver automática) */}
        <Stack.Screen name="farms/[id]" options={{ title: 'Finca' }} />
        <Stack.Screen name="crops/new" options={{ title: 'Nuevo cultivo' }} />
        <Stack.Screen name="crops/[id]" options={{ title: 'Cultivo' }} />
        <Stack.Screen name="pests/new" options={{ title: 'Nueva plaga' }} />
        <Stack.Screen name="pests/[id]" options={{ title: 'Plaga' }} />
        <Stack.Screen name="profile" options={{ title: 'Mi perfil' }} />
        <Stack.Screen name="diagnosis" options={{ title: 'Diagnóstico' }} />
      </Stack>
    </>
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
    return <LoadingView label="Preparando Agro Physis…" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SessionProvider>
              <AccessibilityProvider>
                <FeedbackProvider>
                  <RootStack />
                </FeedbackProvider>
              </AccessibilityProvider>
          </SessionProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
