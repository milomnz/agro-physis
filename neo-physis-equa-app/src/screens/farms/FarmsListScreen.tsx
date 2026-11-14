import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import CenteredScroll from '../../components/CenteredScroll';
import Notice from '../../components/Notice';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { useFarmList } from '../../hooks/useFarmList';
import FarmCard from './components/FarmCard';
import FarmFormFields from './components/FarmFormFields';

export default function FarmsListScreen() {
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    farms,
    filteredFarms,
    loading,
    showForm,
    setShowForm,
    search,
    setSearch,
    success,
    scannerNotice,
    submitting,
    control,
    errors,
    handleSubmit,
    onSubmit,
    goToDetail,
    openScanner,
  } = useFarmList();

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} size="large" />
      </View>
    );
  }

  const headerContent = (
    <>
      <View className="mb-5 gap-1">
        <Text className={`text-2xl font-bricolage ${palette.title}`}>Mis Fincas</Text>
        <Text className={`text-sm ${palette.sub}`}>
          Terrenos agrícolas para el diagnóstico de plagas
        </Text>
      </View>

      <View className="mb-5 flex-row items-center justify-between gap-3">
        <Button
          text={showForm ? 'Cancelar' : '+ Nueva finca'}
          onPress={() => setShowForm((v) => !v)}
          accessibilityLabel={showForm ? 'Cerrar formulario de registro' : 'Registrar nueva finca'}
          accessibilityHint="Muestra u oculta el formulario para inscribir un nuevo terreno agrícola"
          className="flex-1"
        />
      </View>

      {success ? (
        <Notice variant="success" className="mb-4">
          {success}
        </Notice>
      ) : null}
      {errors.root?.message ? (
        <Notice variant="error" className="mb-4">
          {errors.root.message}
        </Notice>
      ) : null}
      {scannerNotice ? (
        <Notice variant="warning" className="mb-4">
          {scannerNotice}
        </Notice>
      ) : null}
    </>
  );

  return (
    <View className={`flex-1 ${palette.bg} p-6`}>
      {showForm ? (
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
          keyboardShouldPersistTaps="handled"
        >
          {headerContent}
          <View className={`mb-6 gap-5 rounded-2xl p-4 ${palette.card}`}>
            <Text className={`text-xl font-bricolage ${palette.title}`}>Registrar finca</Text>

            <FarmFormFields control={control} withPlaceholders />

            <Button
              text={submitting ? 'Registrando…' : 'Registrar finca'}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
            />
          </View>
        </KeyboardAwareScrollView>
      ) : (
        <>
          {headerContent}
          {farms.length === 0 ? (
            <CenteredScroll className={`rounded-2xl ${palette.card}`} contentClassName="gap-3 p-6">
              <Text className={`text-lg font-inter-semibold ${palette.title}`}>No tienes fincas registradas</Text>
              <Text className={`text-center text-sm ${palette.sub}`}>
                Registra tu primera finca para vincularla al diagnóstico de plagas.
              </Text>
              <Button text="+ Registrar finca" onPress={() => setShowForm(true)} />
            </CenteredScroll>
          ) : (
            <FlatList
              data={filteredFarms}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-3"
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
              ListHeaderComponent={
                farms.length > 1 || filteredFarms.length === 0 ? (
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar finca por nombre o ubicación"
                    label="Buscar finca"
                  />
                ) : undefined
              }
              ListEmptyComponent={
                <Text className={`p-6 text-center text-sm ${palette.sub}`}>
                  No se encontraron fincas con el criterio de búsqueda.
                </Text>
              }
              renderItem={({ item }) => (
                <FarmCard farm={item} onScan={openScanner} onOpen={(farm) => goToDetail(farm.id)} />
              )}
            />
          )}
        </>
      )}
    </View>
  );
}
