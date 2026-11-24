import { FlatList, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import CenteredScroll from '../../components/CenteredScroll';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import SearchBar from '../../components/SearchBar';
import { useAccessibility } from '../../accessibility/context';
import { useFarmList } from '../../hooks/useFarmList';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { type } from '../../theme/tokens';
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
    dismissSuccess,
    dismissScannerNotice,
    dismissError,
  } = useFarmList();

  useScreenSpeech(
    farms.length === 0
      ? 'Mis fincas. No tienes fincas registradas.'
      : `Mis fincas. ${farms.length} ${farms.length === 1 ? 'finca registrada' : 'fincas registradas'}.`,
    !loading,
  );

  if (loading) {
    return <LoadingView label="Cargando tus fincas…" />;
  }

  const headerContent = (
    <View className="mb-5 gap-4">
      <ScreenTitle
        icon="leaf"
        title="Mis Fincas"
        subtitle="Terrenos agrícolas para el diagnóstico de plagas"
      />

      <Button
        text={showForm ? 'Cancelar' : 'Nueva finca'}
        icon={showForm ? 'close' : 'add'}
        secondary={showForm}
        onPress={() => setShowForm((v) => !v)}
        accessibilityLabel={showForm ? 'Cerrar formulario de registro' : 'Registrar nueva finca'}
        accessibilityHint="Muestra u oculta el formulario para inscribir un nuevo terreno agrícola"
      />

      {success ? (
        <Notice variant="success" onDismiss={dismissSuccess} autoDismissMs={5000}>
          {success}
        </Notice>
      ) : null}
      {errors.root?.message ? (
        <Notice variant="error" onDismiss={dismissError}>
          {errors.root.message}
        </Notice>
      ) : null}
      {scannerNotice ? (
        <Notice variant="warning" onDismiss={dismissScannerNotice} autoDismissMs={5000}>
          {scannerNotice}
        </Notice>
      ) : null}
    </View>
  );

  return (
    <Screen className="px-6 pt-6">
      {showForm ? (
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
          keyboardShouldPersistTaps="handled"
        >
          {headerContent}
          <Card className="gap-5">
            <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
              Registrar finca
            </Text>

            <FarmFormFields control={control} withPlaceholders />

            <Button
              text={submitting ? 'Registrando…' : 'Registrar finca'}
              icon="checkmark"
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
            />
          </Card>
        </KeyboardAwareScrollView>
      ) : (
        <>
          {headerContent}
          {farms.length === 0 ? (
            <CenteredScroll>
              <EmptyState
                icon="leaf"
                title="No tienes fincas registradas"
                message="Registra tu primera finca para vincularla al diagnóstico de plagas."
              >
                <Button text="Registrar finca" icon="add" onPress={() => setShowForm(true)} />
              </EmptyState>
            </CenteredScroll>
          ) : (
            <FlatList
              data={filteredFarms}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-4"
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
                <Text className={`p-6 text-center ${type.caption} ${palette.sub}`}>
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
    </Screen>
  );
}
