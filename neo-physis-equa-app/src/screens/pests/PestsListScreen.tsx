import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import Button from '../../components/Button';
import CenteredScroll from '../../components/CenteredScroll';
import ChipFilter from '../../components/ChipFilter';
import Notice from '../../components/Notice';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { usePestList } from '../../hooks/usePestList';
import PestCard from './components/PestCard';

export default function PestsListScreen() {
  const { palette } = useAccessibility();
  const {
    filteredPests,
    crops,
    loading,
    error,
    warning,
    search,
    setSearch,
    selectedCrop,
    setSelectedCrop,
    selectedCropLabel,
    goToNew,
    goToDetail,
    goToCrops,
  } = usePestList();

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
          <Text className={`text-2xl font-bricolage ${palette.title}`}>Plagas</Text>
          <Text className={`text-sm ${palette.sub}`}>
            {selectedCropLabel ? `Cultivo: ${selectedCropLabel}` : 'Plagas de tus cultivos'}
          </Text>
        </View>
        <Button text="+ Nueva" onPress={goToNew} className="rounded-xl p-3" />
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

      {crops.length === 0 ? (
        <CenteredScroll contentClassName="gap-3">
          <Text className={`text-center text-lg font-inter-semibold ${palette.body}`}>
            Aún no tienes cultivos registrados
          </Text>
          <Text className={`text-center text-sm ${palette.sub}`}>
            Crea tu primer cultivo para poder registrar plagas.
          </Text>
          <Button text="Ir a mis cultivos" onPress={goToCrops} />
        </CenteredScroll>
      ) : (
        <FlatList
          data={filteredPests}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar plaga por nombre o cultivo"
                label="Buscar plaga"
              />
              <ChipFilter
                label="Filtrar por cultivo"
                options={crops.map((crop) => ({ value: crop.id, label: crop.species }))}
                selected={selectedCrop}
                onSelect={setSelectedCrop}
              />
            </>
          }
          ListEmptyComponent={
            <Text className={`py-6 text-center text-sm ${palette.sub}`}>
              No se encontraron plagas con el criterio de búsqueda.
            </Text>
          }
          renderItem={({ item }) => <PestCard pest={item} onPress={(pest) => goToDetail(pest.id)} />}
        />
      )}
    </View>
  );
}