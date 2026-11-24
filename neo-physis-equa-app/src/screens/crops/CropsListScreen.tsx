import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CenteredScroll from '../../components/CenteredScroll';
import ChipFilter from '../../components/ChipFilter';
import EmptyState from '../../components/EmptyState';
import IconBadge from '../../components/IconBadge';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { useCropList } from '../../hooks/useCropList';
import { type } from '../../theme/tokens';

function formatPlantedDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString();
}

export default function CropsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ farmId?: string }>();
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    crops,
    farms,
    filteredCrops,
    loading,
    error,
    warning,
    search,
    setSearch,
    selectedFarm,
    setSelectedFarm,
    selectedFarmName,
    goToNew,
    dismissError,
    dismissWarning,
  } = useCropList(typeof params.farmId === 'string' ? params.farmId : undefined);

  if (loading) {
    return <LoadingView label="Cargando tus cultivos…" />;
  }

  return (
    <Screen className="px-6 pt-6">
      <View className="mb-5 gap-4">
        <ScreenTitle
          icon="nutrition"
          title="Cultivos"
          subtitle={selectedFarmName ? `Finca: ${selectedFarmName}` : 'Todos tus cultivos'}
          action={
            <Button
              text="Nuevo"
              icon="add"
              onPress={goToNew}
              accessibilityLabel="Registrar nuevo cultivo"
            />
          }
        />

        {error ? (
          <Notice variant="error" onDismiss={dismissError}>
            {error}
          </Notice>
        ) : null}
        {warning ? (
          <Notice variant="warning" onDismiss={dismissWarning} autoDismissMs={5000}>
            {warning}
          </Notice>
        ) : null}
      </View>

      {farms.length === 0 ? (
        <CenteredScroll>
          <EmptyState
            icon="leaf"
            title="Aún no tienes fincas registradas"
            message="Registra tu primera finca para poder crear cultivos."
          >
            <Button text="Ir a mis fincas" icon="leaf-outline" onPress={() => router.push('/farms')} />
          </EmptyState>
        </CenteredScroll>
      ) : crops.length === 0 ? (
        <CenteredScroll>
          <EmptyState
            icon="nutrition"
            title="No tienes cultivos registrados"
            message="Crea tu primer cultivo para empezar a registrar plagas."
          >
            <Button text="Registrar cultivo" icon="add" onPress={goToNew} />
          </EmptyState>
        </CenteredScroll>
      ) : (
        <FlatList
          data={filteredCrops}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-3"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
          ListHeaderComponent={
            <>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar cultivo por especie o finca"
                label="Buscar cultivo"
              />
              <ChipFilter
                label="Filtrar por finca"
                options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
                selected={selectedFarm}
                onSelect={setSelectedFarm}
              />
            </>
          }
          ListEmptyComponent={
            <Text className={`py-6 text-center ${type.caption} ${palette.sub}`}>
              No se encontraron cultivos con el criterio de búsqueda.
            </Text>
          }
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push(`/crops/${item.id}`)}
              accessibilityLabel={`Cultivo ${item.species} de la finca ${item.farm?.name ?? item.farmId}`}
              accessibilityHint="Abre el detalle del cultivo para editarlo, eliminarlo o ver sus plagas"
            >
              <View className="flex-row items-center gap-3">
                <IconBadge icon="nutrition" />
                <View className="flex-1 gap-1">
                  <Text className={`${type.subheading} ${palette.title}`}>{item.species}</Text>
                  <Badge value={item.growthStage} />
                </View>
              </View>
              <Text className={`${type.caption} ${palette.sub}`}>
                Finca: {item.farm?.name ?? 'No asociada'}
              </Text>
              {item.plantedDate ? (
                <Text className={`${type.data} ${palette.faint}`}>
                  Sembrado: {formatPlantedDate(item.plantedDate)}
                </Text>
              ) : null}
              {item.notes ? (
                <Text className={`${type.caption} ${palette.sub}`} numberOfLines={1}>
                  Notas: {item.notes}
                </Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
