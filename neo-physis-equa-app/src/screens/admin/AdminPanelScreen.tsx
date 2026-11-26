import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibility } from '../../accessibility/context';
import Chip from '../../components/Chip';
import ChipFilter, { type ChipFilterOption } from '../../components/ChipFilter';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import SearchBar from '../../components/SearchBar';
import { useAdminPanel } from '../../hooks/useAdminPanel';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { space, type } from '../../theme/tokens';
import AdminMetricsSection from './components/AdminMetricsSection';
import AdminPestDashboard from './components/AdminPestDashboard';
import AdminUserCard from './components/AdminUserCard';

const ROLE_FILTER_OPTIONS: ChipFilterOption[] = [
  { value: 'productor', label: 'Productores' },
  { value: 'colaborador', label: 'Colaboradores' },
  { value: 'admin', label: 'Administradores' },
];

const STATUS_FILTER_OPTIONS: ChipFilterOption[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

export default function AdminPanelScreen() {
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    session,
    sessionLoading,
    sessionReady,
    isAdmin,
    canAccessPanel,
    activeTab,
    setActiveTab,
    metrics,
    users,
    filteredUsers,
    loading,
    refreshing,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    expandedUserId,
    draftRoles,
    updatingUserId,
    pendingDeactivateUser,
    error,
    success,
    refresh,
    toggleExpandUser,
    selectDraftRole,
    saveRole,
    requestToggleStatus,
    confirmDeactivate,
    cancelDeactivate,
    dismissError,
    dismissSuccess,
  } = useAdminPanel();

  const topPestName = metrics?.pests.topPests[0]?.commonName;
  useScreenSpeech(
    metrics
      ? `${isAdmin ? 'Panel de administración' : 'Panel fitosanitario'}. ${metrics.users.total} usuarios, ${metrics.farms.total} fincas y ${metrics.pests.total} reportes de plagas.${topPestName ? ` Plaga principal: ${topPestName}.` : ''}`
      : isAdmin
        ? 'Panel de administración.'
        : 'Panel fitosanitario.',
    !loading && canAccessPanel,
  );

  if (sessionLoading || !sessionReady || !session?.token || !canAccessPanel || loading) {
    return (
      <LoadingView
        label={
          isAdmin
            ? 'Cargando panel de administración…'
            : 'Cargando panel fitosanitario…'
        }
      />
    );
  }

  const sharedTopHeader = (
    <View className="gap-4">
      <ScreenTitle
        icon="shield-checkmark"
        title={isAdmin ? 'Administración' : 'Panel fitosanitario'}
        subtitle={
          isAdmin
            ? 'Dashboard de plagas, métricas globales y gestión de cuentas'
            : 'Métricas globales y monitoreo de plagas principales (solo lectura)'
        }
      />

      {isAdmin ? (
        <View
          accessibilityRole="radiogroup"
          className="flex-row flex-wrap gap-2"
        >
          <Chip
            radio
            label="Dashboard"
            selected={activeTab === 'dashboard'}
            onPress={() => setActiveTab('dashboard')}
            accessibilityLabel="Ver dashboard de métricas y plagas principales"
          />
          <Chip
            radio
            label={`Usuarios (${users.length})`}
            selected={activeTab === 'users'}
            onPress={() => setActiveTab('users')}
            accessibilityLabel={`Gestionar ${users.length} usuarios`}
          />
        </View>
      ) : null}

      {success ? (
        <Notice variant="success" onDismiss={dismissSuccess} autoDismissMs={5000}>
          {success}
        </Notice>
      ) : null}

      {error ? (
        <Notice variant="error" onDismiss={dismissError}>
          {error}
        </Notice>
      ) : null}
    </View>
  );

  const bottomPadding = Math.max(insets.bottom, space.gutter) + 16;

  if (activeTab === 'dashboard' || !isAdmin) {
    return (
      <Screen>
        <ScrollView
          contentContainerClassName="gap-5"
          contentContainerStyle={{
            padding: space.gutter,
            paddingBottom: bottomPadding,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={palette.spinner}
              colors={[palette.spinner]}
            />
          }
        >
          {sharedTopHeader}
          {metrics ? (
            <>
              <AdminMetricsSection metrics={metrics} />
              <AdminPestDashboard metrics={metrics} />
            </>
          ) : null}
        </ScrollView>
      </Screen>
    );
  }

  const usersListHeader = (
    <View className="mb-2 gap-5">
      {sharedTopHeader}

      <View className="gap-3">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
            Gestión de usuarios
          </Text>
          <Text className={`${type.data} ${palette.sub}`}>
            {filteredUsers.length} de {users.length}
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o correo electrónico"
          label="Buscar usuario"
        />

        <ChipFilter
          label="Filtrar por rol"
          options={ROLE_FILTER_OPTIONS}
          selected={roleFilter}
          onSelect={setRoleFilter}
        />

        <ChipFilter
          label="Filtrar por estado"
          options={STATUS_FILTER_OPTIONS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4"
        contentContainerStyle={{
          padding: space.gutter,
          paddingBottom: bottomPadding,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={palette.spinner}
            colors={[palette.spinner]}
          />
        }
        ListHeaderComponent={usersListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="people"
            title="Sin usuarios coincidentes"
            message="No encontramos cuentas que coincidan con la búsqueda o los filtros activos."
          />
        }
        renderItem={({ item }) => (
          <AdminUserCard
            user={item}
            isSelf={item.id === session.id}
            expanded={expandedUserId === item.id}
            draftRole={draftRoles[item.id] ?? item.role}
            updating={updatingUserId === item.id}
            onToggleExpand={() => toggleExpandUser(item)}
            onSelectRole={(role) => selectDraftRole(item.id, role)}
            onSaveRole={() => void saveRole(item)}
            onRequestToggleStatus={() => requestToggleStatus(item)}
          />
        )}
      />

      <ConfirmModal
        visible={Boolean(pendingDeactivateUser)}
        title="Desactivar cuenta de usuario"
        message={
          pendingDeactivateUser
            ? `¿Deseas desactivar la cuenta de ${pendingDeactivateUser.name} (${pendingDeactivateUser.email})? El usuario perderá el acceso inmediatamente hasta que reactives su cuenta.`
            : ''
        }
        confirmText="Desactivar cuenta"
        loadingText="Desactivando…"
        confirmIcon="ban-outline"
        cancelText="Cancelar"
        danger
        loading={
          Boolean(pendingDeactivateUser) &&
          updatingUserId === pendingDeactivateUser?.id
        }
        onConfirm={confirmDeactivate}
        onCancel={cancelDeactivate}
      />
    </Screen>
  );
}
