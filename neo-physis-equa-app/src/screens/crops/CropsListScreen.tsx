import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import CenteredScroll from '../../components/CenteredScroll';
import ChipFilter from '../../components/ChipFilter';
import Notice from '../../components/Notice';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { useCropList } from '../../hooks/useCropList';

export default function CropsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ farmId?: string }>();
  const { palette } = useAccessibility();
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
  } = useCropList(typeof params.farmId === 'string' ? params.farmId : undefined);

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${palette.bg} p-6`}>
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className={`text-2xl font-bricolage ${palette.title}`}>Cultivos</Text>
          <Text className={`text-sm ${palette.sub}`}>
            {selectedFarmName ? `Finca: ${selectedFarmName}` : 'Todos tus cultivos'}
          </Text>
        </View>
        <Button text="+ Nuevo" onPress={goToNew} className="rounded-xl p-3" />
      </View>

      {error ? (
        <Notice variant="error" className="mb-4">
          {error}
        </Notice>
      ) : null}
      {warning ? (
        <Notice variant="warning" className="mb-4">
          {warning}
        </Notice>
      ) : null}

      {farms.length === 0 ? (
        <CenteredScroll contentClassName="gap-3">
          <Text className={`text-center text-lg font-inter-semibold ${palette.body}`}>
            Aún no tienes fincas registradas
          </Text>
          <Text className={`text-center text-sm ${palette.sub}`}>
            Registra tu primera finca para poder crear cultivos.
          </Text>
          <Button text="Ir a mis fincas" onPress={() => router.push('/farms')} />
        </CenteredScroll>
      ) : crops.length === 0 ? (
        <CenteredScroll contentClassName="gap-3">
          <Text className={`text-center text-lg font-inter-semibold ${palette.body}`}>
            No tienes cultivos registrados
          </Text>
          <Text className={`text-center text-sm ${palette.sub}`}>
            Crea tu primer cultivo para empezar a registrar plagas.
          </Text>
          <Button text="+ Registrar cultivo" onPress={goToNew} />
        </CenteredScroll>
      ) : (
        <FlatList
          data={filteredCrops}
          keyExtractor={(item) => item.id}
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
            <Text className={`py-6 text-center text-sm ${palette.sub}`}>
              No se encontraron cultivos con el criterio de búsqueda.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`Cultivo ${item.species} de la finca ${item.farm?.name ?? item.farmId}`}
              accessibilityHint="Abre el detalle del cultivo para editarlo, eliminarlo o ver sus plagas"
              accessibilityRole="button"
              onPress={() => router.push(`/crops/${item.id}`)}
              className={`mb-3 rounded-2xl p-4 ${palette.card}`}
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className={`flex-1 text-lg font-inter-semibold ${palette.title}`}>{item.species}</Text>
                <Badge value={item.growthStage} />
              </View>
              <Text className={`mt-1 text-sm ${palette.sub}`}>
                Finca: {item.farm?.name ?? 'No asociada'}
              </Text>
              {item.plantedDate ? (
                <Text className={`mt-0.5 text-xs ${palette.faint}`}>
                  Sembrado: {new Date(item.plantedDate).toLocaleDateString()}
                </Text>
              ) : null}
              {item.notes ? (
                <Text className={`mt-1 text-xs ${palette.sub}`} numberOfLines={1}>
                  Notas: {item.notes}
                </Text>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
