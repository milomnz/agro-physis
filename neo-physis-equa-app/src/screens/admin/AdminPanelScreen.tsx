import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibility } from '../../accessibility/context';
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

  useScreenSpeech(
    metrics
      ? `Panel de administración. ${metrics.users.total} usuarios registrados, ${metrics.farms.total} fincas y ${metrics.crops.total} cultivos.`
      : 'Panel de administración.',
    !loading && isAdmin,
  );

  if (sessionLoading || !sessionReady || !session?.token || !isAdmin || loading) {
    return <LoadingView label="Cargando panel de administración…" />;
  }

  const listHeader = (
    <View className="mb-2 gap-5">
      <ScreenTitle
        icon="shield-checkmark"
        title="Administración"
        subtitle="Métricas globales, roles y estado de las cuentas"
      />

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

      {metrics ? <AdminMetricsSection metrics={metrics} /> : null}

      <View className="gap-3 pt-2">
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
          paddingBottom: Math.max(insets.bottom, space.gutter) + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={palette.spinner}
            colors={[palette.spinner]}
          />
        }
        ListHeaderComponent={listHeader}
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
