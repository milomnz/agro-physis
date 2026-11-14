import { Drawer } from 'expo-router/drawer';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, type Href } from 'expo-router';
import { useAccessibility } from '../../src/accessibility/context';
import { useSession } from '../../src/hooks/useSession';
import { colors } from '../../src/theme/tokens';

function CustomDrawerContent({ onClose }: { onClose: () => void }) {
  const { highContrast } = useAccessibility();
  const { signOut } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Nos permite saber en qué pantalla estamos
  const insets = useSafeAreaInsets();

  const textColor = highContrast ? colors.crema : colors.tinta;
  const borderColor = highContrast ? colors.crema : colors.azul;
  const activeText = colors.crema;

  // Componente reutilizable para los botones del menú
  const NavItem = ({
    path,
    icon,
    label,
  }: {
    path: Href;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => {
    const target = String(path);
    // Verificamos si la ruta actual coincide con la del botón
    const isActive = pathname === target || pathname.startsWith(`${target}/`);

    return (
      <Pressable
        onPress={() => {
          onClose();
          router.navigate(path);
        }}
        className={`mb-2 min-h-12 flex-row items-center rounded-campo p-3 ${isActive ? 'bg-turquesa' : 'active:bg-turquesa/10'}`}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Ionicons name={icon} size={24} color={isActive ? activeText : textColor} />
        <Text
          className="ml-4 flex-1 text-base"
          style={{ fontFamily: 'Inter_600SemiBold', color: isActive ? activeText : textColor }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: highContrast ? colors.tinta : colors.crema }}>
      {/* 1. Cabecera Visual (Respetando el inset superior de la barra de estado) */}
      <View
        className="mb-4 border-b px-6 pb-4"
        style={{ paddingTop: insets.top + 16, borderBottomColor: borderColor + '30' }}
      >
        <Text
          className="text-2xl"
          style={{ fontFamily: 'BricolageGrotesque_700Bold', color: highContrast ? colors.crema : colors.azul }}
        >
          AgroPhysis
        </Text>
        <Text className="text-sm opacity-70" style={{ fontFamily: 'Inter_400Regular', color: textColor }}>
          Menú de gestión
        </Text>
      </View>

      {/* 2. Items Nativos 100% Controlados */}
      <ScrollView className="flex-1 px-4">
        <NavItem path="/home" icon="home-outline" label="Inicio" />
        <NavItem path="/farms" icon="leaf-outline" label="Mis Fincas" />
        <NavItem path="/crops" icon="nutrition-outline" label="Mis Cultivos" />
        <NavItem path="/pests" icon="bug-outline" label="Catálogo de Plagas" />
        <NavItem path="/profile" icon="person-outline" label="Mi perfil" />
      </ScrollView>

      {/* 3. Botón inferior para cerrar sesión */}
      <View
        className="border-t px-4 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16), borderTopColor: borderColor + '30' }}
      >
        <Pressable
          onPress={async () => {
            onClose();
            await signOut();
            router.replace('/login');
          }}
          className="min-h-12 flex-row items-center rounded-campo p-3 active:bg-turquesa/10"
          accessibilityLabel="Cerrar sesión"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={textColor} />
          <Text className="ml-4 flex-1 text-base" style={{ fontFamily: 'Inter_600SemiBold', color: textColor }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { highContrast } = useAccessibility();

  const bgTheme = highContrast ? colors.tinta : colors.crema;
  const headerTheme = highContrast ? colors.tinta : colors.azul;

  return (
    <Drawer
      drawerContent={({ navigation }) => (
        <CustomDrawerContent onClose={() => navigation.closeDrawer()} />
      )}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: headerTheme },
        headerTintColor: colors.crema,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 18 },
        sceneContainerStyle: { backgroundColor: bgTheme },
        drawerStyle: { backgroundColor: bgTheme, width: '75%' },

        headerLeft: () => (
          <Pressable
            onPress={() => navigation.toggleDrawer()} // Ahora sí funcionará nativamente
            className="min-h-12 min-w-12 items-center justify-center pl-5 active:opacity-70"
            accessibilityLabel="Abrir menú de navegación"
            accessibilityRole="button"
            accessibilityHint="Despliega el menú lateral de navegación"
          >
            <Ionicons name="menu" size={28} color={colors.crema} />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen name="home" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="farms/index" options={{ title: 'Mis Fincas' }} />
      <Drawer.Screen name="crops/index" options={{ title: 'Mis Cultivos' }} />
      <Drawer.Screen name="pests/index" options={{ title: 'Plagas' }} />
    </Drawer>
  );
}
