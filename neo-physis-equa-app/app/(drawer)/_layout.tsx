import { Drawer } from 'expo-router/drawer';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, type Href } from 'expo-router';
import { useAccessibility } from '../../src/accessibility/context';
import BrandHero, { HeaderBackground } from '../../src/components/BrandHero';
import Screen from '../../src/components/Screen';
import { useSession } from '../../src/hooks/useSession';
import { colors, fonts, gradients } from '../../src/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

interface NavItemProps {
  path: Href;
  icon: IconName;
  label: string;
  onNavigate: (path: Href) => void;
}

// Activo = relleno de hoja + ícono lleno; inactivo = ícono de contorno. No depende solo del color.
function NavItem({ path, icon, label, onNavigate }: NavItemProps) {
  const { palette } = useAccessibility();
  const pathname = usePathname();
  const target = String(path);
  const isActive = pathname === target || pathname.startsWith(`${target}/`);

  return (
    <Pressable
      onPress={() => onNavigate(path)}
      className={`min-h-14 flex-row items-center gap-4 rounded-boton px-4 py-3 ${isActive ? '' : 'active:bg-azul/10'}`}
      style={isActive ? { backgroundColor: colors.verde, backgroundImage: gradients.leaf } : undefined}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Ionicons
        name={isActive ? icon : (`${icon}-outline` as IconName)}
        size={24}
        color={isActive ? colors.tinta : palette.icon}
      />
      <Text
        className={`flex-1 text-base font-inter-semibold ${isActive ? 'text-tinta' : palette.title}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CustomDrawerContent({ onClose }: { onClose: () => void }) {
  const { palette } = useAccessibility();
  const { session, signOut } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAdmin = session?.role === 'admin';
  const canAccessPanel = isAdmin || session?.role === 'colaborador';

  const navigate = (path: Href) => {
    onClose();
    router.navigate(path);
  };

  return (
    <Screen>
      <BrandHero bleed title="Agro Physis" subtitle="Menú de gestión" />

      <ScrollView className="flex-1" contentContainerClassName="gap-2 px-4 py-5">
        <NavItem path="/home" icon="home" label="Inicio" onNavigate={navigate} />
        <NavItem path="/farms" icon="leaf" label="Mis Fincas" onNavigate={navigate} />
        <NavItem path="/crops" icon="nutrition" label="Mis Cultivos" onNavigate={navigate} />
        <NavItem path="/pests" icon="bug" label="Catálogo de Plagas" onNavigate={navigate} />
        <NavItem
          path="/diagnosis"
          icon="medkit"
          label="Diagnóstico de síntomas"
          onNavigate={navigate}
        />
        {canAccessPanel ? (
          <NavItem
            path="/admin"
            icon="shield-checkmark"
            label={isAdmin ? 'Administración' : 'Panel fitosanitario'}
            onNavigate={navigate}
          />
        ) : null}
        <NavItem path="/profile" icon="person" label="Mi perfil" onNavigate={navigate} />
      </ScrollView>

      <View className="px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className={`mb-3 h-px ${palette.divider}`} />
        <Pressable
          onPress={async () => {
            onClose();
            await signOut();
            router.replace('/login');
          }}
          className="min-h-14 flex-row items-center gap-4 rounded-boton px-4 py-3 active:bg-azul/10"
          accessibilityLabel="Cerrar sesión"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={palette.icon} />
          <Text className={`flex-1 text-base font-inter-semibold ${palette.title}`}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

export default function DrawerLayout() {
  const { palette } = useAccessibility();
  const { session } = useSession();
  const isAdmin = session?.role === 'admin';

  return (
    <Drawer
      drawerContent={({ navigation }) => (
        <CustomDrawerContent onClose={() => navigation.closeDrawer()} />
      )}
      screenOptions={({ navigation }) => ({
        headerBackground: HeaderBackground,
        headerTintColor: colors.crema,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
        sceneStyle: { backgroundColor: palette.canvas },
        drawerStyle: { backgroundColor: palette.canvas, width: '80%' },
        overlayColor: `${colors.tinta}99`,

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
      <Drawer.Screen
        name="admin/index"
        options={{ title: isAdmin ? 'Administración' : 'Panel fitosanitario' }}
      />
    </Drawer>
  );
}
