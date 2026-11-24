import { Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import { useAccessibility } from '../../accessibility/context';
import { useFarmDetail } from '../../hooks/useFarmDetail';
import { space, type } from '../../theme/tokens';
import FarmFormFields from './components/FarmFormFields';

export default function FarmDetailScreen() {
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    farm,
    loading,
    saving,
    saved,
    screenError,
    confirmingDelete,
    deleting,
    control,
    errors,
    onSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    goToCrops,
    goToFarms,
    dismissSaved,
    dismissScreenError,
    dismissRootError,
  } = useFarmDetail();

  if (loading) {
    return <LoadingView label="Cargando la finca…" />;
  }

  if (!farm) {
    return (
      <Screen className="items-center justify-center gap-4 p-6">
        <EmptyState
          icon="cloud-offline-outline"
          title="No se pudo cargar la finca"
          message="Revisa tu conexión y vuelve a intentarlo desde tu lista de fincas."
        >
          {screenError ? (
            <Notice variant="error" onDismiss={dismissScreenError}>
              {screenError}
            </Notice>
          ) : null}
          <Button text="Volver a mis fincas" icon="arrow-back" onPress={goToFarms} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 20,
          padding: space.gutter,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle icon="leaf" title="Mi finca" subtitle="Gestiona los datos de tu terreno agrícola" />

        {saved ? (
          <Notice variant="success" onDismiss={dismissSaved} autoDismissMs={5000}>
            Cambios guardados correctamente
          </Notice>
        ) : null}
        {screenError ? (
          <Notice variant="error" onDismiss={dismissScreenError}>
            {screenError}
          </Notice>
        ) : null}
        {errors.root?.message ? (
          <Notice variant="error" onDismiss={dismissRootError}>
            {errors.root.message}
          </Notice>
        ) : null}

        <Card className="gap-5">
          <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
            Editar datos
          </Text>

          <FarmFormFields control={control} />

          <Button
            text={saving ? 'Guardando…' : 'Guardar cambios'}
            icon="save-outline"
            onPress={onSubmit}
            disabled={saving}
            accessibilityHint="Guarda los cambios de los datos de la finca"
          />
        </Card>

        <Card>
          <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
            Cultivos de esta finca
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Desde aquí puedes registrar y gestionar los cultivos sembrados en {farm.name}.
          </Text>
          <Button
            text="Ver y registrar cultivos"
            icon="nutrition-outline"
            onPress={goToCrops}
            accessibilityHint="Abre la gestión de cultivos de esta finca"
          />
        </Card>

        <Button
          text="Eliminar finca"
          icon="trash-outline"
          onPress={requestDelete}
          danger
          disabled={deleting}
          accessibilityHint="Elimina la finca y todos sus datos asociados"
        />
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Eliminar finca"
        message={`¿Seguro que deseas eliminar la finca "${farm.name}"? Esta acción eliminará también sus cultivos y plagas asociadas.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Screen>
  );
}
