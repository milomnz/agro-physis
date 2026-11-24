import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import CenteredScroll from '../../components/CenteredScroll';
import ChipFilter from '../../components/ChipFilter';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { usePestList } from '../../hooks/usePestList';
import { type } from '../../theme/tokens';
import PestCard from './components/PestCard';

export default function PestsListScreen() {
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
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
    dismissError,
    dismissWarning,
  } = usePestList();

  if (loading) {
    return <LoadingView label="Cargando el catálogo de plagas…" />;
  }

  return (
    <Screen className="px-6 pt-6">
      <View className="mb-5 gap-4">
        <ScreenTitle
          icon="bug"
          title="Plagas"
          subtitle={selectedCropLabel ? `Cultivo: ${selectedCropLabel}` : 'Plagas de tus cultivos'}
          action={
            <Button
              text="Nueva"
              icon="add"
              onPress={goToNew}
              accessibilityLabel="Registrar nueva plaga"
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

      {crops.length === 0 ? (
        <CenteredScroll>
          <EmptyState
            icon="nutrition"
            title="Aún no tienes cultivos registrados"
            message="Crea tu primer cultivo para poder registrar plagas."
          >
            <Button text="Ir a mis cultivos" icon="nutrition-outline" onPress={goToCrops} />
          </EmptyState>
        </CenteredScroll>
      ) : (
        <FlatList
          data={filteredPests}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-3"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
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
            <Text className={`py-6 text-center ${type.caption} ${palette.sub}`}>
              No se encontraron plagas con el criterio de búsqueda.
            </Text>
          }
          renderItem={({ item }) => <PestCard pest={item} onPress={(pest) => goToDetail(pest.id)} />}
        />
      )}
    </Screen>
  );
}
